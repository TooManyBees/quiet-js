process.title = "node quiet-js";

const express = require("express");
const http = require("http");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const pino = require("pino");
const expressPino = require("express-pino-logger");
const generateRoomName = require("./generateRoomName");

dotenv.config();

function slice(object, fields) {
  const result = {};
  for (field of fields) {
    result[field] = object[field];
  }
  return result;
}

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const expressLogger = expressPino({
  logger,
  serializers: {
    req: (req) => ({
      ...slice(req, ["id", "method", "url"]),
      headers: slice(req.headers, ["content-length", "user-agent", "content-type", "referer"])
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: slice(res.headers, ["content-type", "content-length"]),
    }),
  },
});

const app = express();
app.use(expressLogger);
app.use(express.json());
const rooms = new Map();
const clients = new Map();
const pendingCanvasRelays = new Map();

function activeUsers(room) {
  return room.filter(id => clients.has(id));
}

function auth(req, res, next) {
  let token = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : req.query.token;

  if (!token) {
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.get("/", (req, res) => {
  let slug;
  while (!slug || rooms.has(slug)) {
    slug = generateRoomName();
  }
  res.redirect(`/room/${slug}`);
});

app.get("/api/canvas-data", auth, (req, res) => {
  const userId = req.user.id;

  const existingResponse = pendingCanvasRelays.get(userId);
  if (existingResponse) {
    // FIXME: correct for abruptly closing connection?
    existingResponse.end();
  }
  const room = rooms.get(req.user.roomId);
  if (room && room.length > 1) {
    // TODO: pick random peer rather than first;
    const peerId = room.find(peerId => userId !== peerId && clients.has(peerId));
    if (peerId) {
      const peer = clients.get(peerId);
      peer.emit("send-canvas-data", userId);
    } else {
      // No connected peers to send canvas data to!
      res.sendStatus(500);
      return;
    }
  }
  pendingCanvasRelays.set(userId, res);
});

app.post("/api/canvas-data/:peerId", auth, (req, res) => {
  const peerId = req.params.peerId;
  const pendingResponse = pendingCanvasRelays.get(peerId);
  if (pendingResponse) {
    pendingResponse.status(200);
    pendingResponse.set("Content-Type", "application/octet-stream")
    req.pipe(pendingResponse);
    req.on('end', () => {
      pendingResponse.end();
      res.sendStatus(204);
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/api/relay/:peerId/:event", auth, (req, res) => {
  const peerId = req.params.peerId;
  const client = clients.get(peerId);
  if (client) {
    client.emit(req.params.event, { peer: req.user, data: req.body });
  }
  res.sendStatus(200);
});

app.post("/api/access", (req, res) => {
  if (!req.body.roomId) {
    return res.sendStatus(400);
  }
  const user = {
    id: uuid.v4(),
    roomId: req.body.roomId,
  };

  const token = jwt.sign(user, process.env.TOKEN_SECRET);
  return res.json({ userId: user.id, token });
});

function disconnected(user) {
  logger.debug(`disconnecting ${user.id}`);
  clients.delete(user.id);

  // Intentionally keep userIds in the room when disconnecting
  // (only discard the corresponding `client`) so that when the
  // same user rejoins, they remain in the same spot.

  const room = rooms.get(user.roomId);
  if (room && room.includes(user.id)) {
    for (const peerId of room) {
      if (peerId === user.id) continue;
      const peer = clients.get(peerId);
      peer && peer.emit("remove-peer", { peerId: user.id, userIds: activeUsers(room) });
    }
    if (!room.some(userId => clients.has(userId))) {
      logger.debug(`deleting room ${user.roomId}`);
      rooms.delete(user.roomId);
    }
  }
}

app.get("/api/connect", auth, (req, res) => {
  if (req.headers.accept !== "text/event-stream") {
    return res.status(405);
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.flushHeaders();

  const client = {
    id: req.user.id,
    user: req.user,
    emit(event, data) {
      res.write(`id: ${uuid.v4()}\n`);
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  clients.set(client.id, client);
  client.emit("connected", { user: req.user });

  req.on("close", () => disconnected(req.user));
});

app.post("/api/:roomId/join", auth, (req, res) => {
  // TODO: check that req.params.roomId === req.user.roomId
  const roomId = req.params.roomId;
  const userId = req.user.id;
  let room = rooms.get(roomId);

  if (!room) {
    room = [];
    rooms.set(roomId, room);
  }

  if (!room.includes(userId)) {
    room.push(userId);
  }

  logger.debug(`user joining room ${roomId}: ${req.user.id}`);

  const userIds = activeUsers(room);

  for (const peerId of userIds) {
    if (peerId === userId) continue;
    const peerClient = clients.get(peerId);
    const userClient = clients.get(userId);
    if (peerClient && userClient) {
      peerClient.emit("add-peer", {
        peer: req.user,
        offer: false,
        userIds,
      });
      userClient.emit("add-peer", {
        peer: peerClient.user,
        offer: true,
        userIds,
      });
    }
  }

  return res.sendStatus(200);
});

const server = http.createServer(app);

const dest = {
  path: path.join(__dirname, "tmp", "quiet.sock"),
  writableAll: true,
};

function close() {
  server.close();
  try { fs.rmSync("tmp/quiet.pid"); } catch (_) {}
  process.exit();
}

process.on("SIGINT", close);
process.on("SIGTERM", close);

const STATE_FILE = "tmp/quiet.state";
const START_TIME = Date.now();
process.on("SIGUSR1", (e) => {
  const usersPerRoom = Object.fromEntries(Array.from(rooms).map(([k, vs]) => [k, vs.length]));
  const uptime = Math.floor((Date.now() - START_TIME) / 1000);
  fs.writeFileSync(STATE_FILE, JSON.stringify({
    uptime,
    numRooms: rooms.length,
    numClients: clients.size,
    rooms: usersPerRoom,
  }));
});

server.listen(dest, () => {
  fs.writeFileSync("tmp/quiet.pid", process.pid.toString());
  console.error(`server started on ${dest.path} at ${new Date()}`)
  logger.info(`server started on ${dest.path}`);
});
