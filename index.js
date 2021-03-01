const express = require("express");
const http = require("http");
const uuid = require("uuid");
const niceware = require("niceware");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.static(__dirname));
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

app.post("/relay/:peerId/:event", auth, (req, res) => {
  const peerId = req.params.peerId;
  const clients = app.locals.clients;
  if (clients.has(peerId)) {
    clients.get(peerId).emit(req.params.event, { peer: req.user, data: req.body });
  }
  res.sendStatus(200);
});

app.post("/access", (req, res) => {
  if (!req.body.username) {
    return res.sendStatus(400);
  }

  const user = {
    id: uuid.v4(),
    username: req.body.username,
  };

  const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "3600s" });
  return res.json({ token });
});

function disconnected(client) {
  const { clients, rooms } = app.locals;
  clients.delete(client.id);
  for (const [roomId, room] of rooms) {
    if (room.has(client.id)) {
      for (const peerId of room) {
        const peer = clients.get(peerId);
        peer && peer.emit('remove-peer', { peer: client.id, roomId });
      }
      room.delete(client.id);
    }
    if (room.size === 0) {
      rooms.delete(roomId)
    }
  }
}

app.get("/connect", auth, (req, res) => {
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

  req.on("close", () => disconnected(client));
});

app.get("/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/:roomId/join", auth, (req, res) => {
  const roomId = req.params.roomId;
  const { clients, rooms } = app.locals;
  let room = rooms.get(roomId);

  if (room && room.has(req.user.id)) {
    return res.sendStatus(204);
  }

  if (!room) {
    room = new Set();
    rooms.set(roomId, room);
  }

  console.log(`user joining room ${roomId}: ${req.user.id}`);

  for (const peerId of room.values()) {
    if (clients.has(peerId) && clients.has(req.user.id)) {
      clients.get(peerId).emit("add-peer", { peer: req.user, offer: false });
      clients.get(req.user.id).emit("add-peer", { peer: clients.get(peerId).user, roomId, offer: true });
    }
  }

  room.add(req.user.id);
  return res.sendStatus(200);
});

const server = http.createServer(app);

server.listen(8888, () => console.log("server started"));
