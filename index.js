const express = require("express");
const http = require("http");
const ws = require("ws");
const uuid = require("uuid");

const app = express();
app.use(express.static(__dirname));
app.locals.connections = [];
app.locals.rooms = {};

const server = http.createServer(app);
const wss = new ws.Server({ server });

function broadcastConnections() {
  const ids = app.locals.connections.map(conn => conn._connId);
  app.locals.connections.forEach(conn => {
    conn.send(JSON.stringify({ type: "ids", ids }));
  });
}

wss.on("connection", ws => {
  app.locals.connections.push(ws);
  const connId = `conn-${uuid.v4()}`
  ws._connId = connId;
  console.log(`new connection ${connId}`);

  ws.send(JSON.stringify({ type: "connection", id: connId }));

  broadcastConnections();

  ws.on("close", () => {
    let idx = app.locals.connections.indexOf(ws);
    app.locals.connections.splice(idx, 1);
    broadcastConnections();
  });

  ws.on("message", message => {
    for (const conn of app.locals.connections) {
      if (conn !== ws) {
        conn.send(message);
      }
    }
  });
});

server.listen(8888, () => console.log("server started"));
