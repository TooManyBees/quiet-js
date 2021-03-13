const express = require("express");
const http = require("http");
const uuid = require("uuid");
const niceware = require("niceware");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, "..", "client")));
app.use(express.json());
app.locals.rooms = new Map();
app.locals.clients = new Map();
app.locals.pendingCanvasRelays = new Map();

function activeUsers(room) {
  return room.filter(id => app.locals.clients.has(id));
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
  const slug = niceware.generatePassphrase(10).join("-");
  res.redirect(`/${slug}`);
});

app.get("/api/relay/canvas-data", auth, (req, res) => {
  const userId = req.user.id;
  const { rooms, clients, pendingCanvasRelays } = app.locals;

  const existingResponse = pendingCanvasRelays.get(userId);
  if (existingResponse) {
    // FIXME: correct for abruptly closing connection?
    existingResponse.end();
  }
  const room = rooms.get(req.user.roomId);
  if (room && room.length > 1) {
    // TODO: pick random peer rather than first;
    const peerId = room.filter(peerId => peerId !== userId)[0];
    const peer = clients.get(peerId);
    peer && peer.emit("send-canvas-data", userId);
  }
  pendingCanvasRelays.set(userId, res);
});

app.post("/api/relay/:peerId/canvas-data", auth, (req, res) => {
  const peerId = req.params.peerId;
  const pendingResponse = app.locals.pendingCanvasRelays.get(peerId);
  if (pendingResponse) {
    pendingResponse.status(200);
    pendingResponse.set("Content-Type", "application/octet-stream")
    req.pipe(pendingResponse);
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

app.post("/api/relay/:peerId/:event", auth, (req, res) => {
  const peerId = req.params.peerId;
  const clients = app.locals.clients;
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
  const { clients, rooms } = app.locals;
  console.log(`disconnecting ${user.id}`);
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
      console.log(`deleting room ${user.roomId}`);
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

  app.locals.clients.set(client.id, client);
  client.emit("connected", { user: req.user });

  req.on("close", () => disconnected(req.user));
});

app.post("/api/:roomId/join", auth, (req, res) => {
  // TODO: check that req.params.roomId === req.user.roomId
  const roomId = req.params.roomId;
  const { clients, rooms } = app.locals;
  let room = rooms.get(roomId);

  if (!room) {
    room = [];
    rooms.set(roomId, room);
  }

  if (!room.includes(req.user.id)) {
    room.push(req.user.id);
  }

  console.log(`user joining room ${roomId}: ${req.user.id}`);

  const userIds = activeUsers(room);

  for (const peerId of room) {
    if (peerId === req.user.id) continue;
    if (clients.has(peerId) && clients.has(req.user.id)) {
      clients.get(peerId).emit("add-peer", {
        peer: req.user,
        offer: false,
        userIds,
      });
      clients.get(req.user.id).emit("add-peer", {
        peer: clients.get(peerId).user,
        roomId,
        offer: true,
        userIds,
      });
    }
  }

  return res.sendStatus(200);
});

const server = http.createServer(app);

server.listen(8888, () => console.log("server started"));
