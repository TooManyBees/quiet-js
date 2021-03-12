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

  const room = rooms.get(user.roomId);
  if (room && room.includes(user.id)) {
    room.splice(room.indexOf(user.id), 1);
    for (const peerId of room) {
      const peer = clients.get(peerId);
      peer && peer.emit("remove-peer", { peerId: user.id, userIds: room });
    }
    if (room.size === 0) {
      rooms.delete(roomId);
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

app.get("/api/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.post("/api/:roomId/join", auth, (req, res) => {
  // TODO: check that req.params.roomId === req.user.roomId
  const roomId = req.params.roomId;
  const { clients, rooms } = app.locals;
  let room = rooms.get(roomId);

  if (room && room.includes(req.user.id)) {
    return res.sendStatus(204);
  }

  if (!room) {
    room = [];
    rooms.set(roomId, room);
  }

  room.push(req.user.id);

  console.log(`user joining room ${roomId}: ${req.user.id}`);

  for (const peerId of room) {
    if (peerId === req.user.id) continue;
    if (clients.has(peerId) && clients.has(req.user.id)) {
      clients.get(peerId).emit("add-peer", {
        peer: req.user,
        offer: false,
        userIds: room,
      });
      clients.get(req.user.id).emit("add-peer", {
        peer: clients.get(peerId).user,
        roomId,
        offer: true,
        userIds: room,
      });
    }
  }

  return res.sendStatus(200);
});

const server = http.createServer(app);

server.listen(8888, () => console.log("server started"));
