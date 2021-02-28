import "https://unpkg.com/simple-peer@9.9.3/simplepeer.min.js";

const cavas = document.getElementById('canvas');
const context = canvas.getContext("2d");

const state = {
  canvas,
  context,
  localId: undefined,
  peerIds: [],
  peerConnections: {},
  initiator: false,
};

function broadcast(event) {
  Object.values(state.peerConnections).forEach(peer => {
    peer.send(JSON.stringify(event));
  });
}

let lastPoint;
function drawPoint(a, b) {
  context.strokeStyle = "red",
  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.lineWidth = 5;
  context.lineCap = "round";
  context.stroke();
}
window.onmousemove = function(e) {
  const thisPoint = { x: e.offsetX, y: e.offsetY };
  if (!lastPoint) {
    lastPoint = thisPoint;
  }
  if (e.buttons) {
    drawPoint(lastPoint, thisPoint);
    broadcast({ type: "draw", from: lastPoint, to: thisPoint });
  }
  lastPoint = thisPoint;
};
window.onmousedown = function(e) {
  const thisPoint = { x: e.offsetX, y: e.offsetY };
  drawPoint(thisPoint, thisPoint);
};

const wsConn = new WebSocket("ws:127.0.0.1:8888");
wsConn.onopen = (e) => {
  console.log("websocket open", e);
};
wsConn.onerror = (e) => {
  console.log("websocket error", e);
};
wsConn.onmessage = (e) => {
  const data = JSON.parse(e.data);
  switch (data.type) {
    case 'connection':
      state.localId = data.id;
      break;
    case 'ids':
      state.peerIds = data.ids;
      connect();
      break;
    case 'signal':
      signal(data.id, data.data);
      break;
  }
};

function onPeerData(id, buffer) {
  const data = JSON.parse(buffer);
  switch (data.type) {
    case "draw":
      drawPoint(data.from, data.to);
      break;
    default:
      console.log(`Unknown message from ${id}`, data);
  }
}

function connect() {
  Object.keys(state.peerConnections).forEach(id => {
    if (!state.peerIds.includes(id)) {
      state.peerConnections[id].destroy();
      delete state.peerConnections[id];
    }
  });
  if (state.peerIds.length === 1) {
    state.initiator = true;
  }
  state.peerIds.forEach(id => {
    if (id === state.localId || state.peerConnections[id]) {
      return;
    }

    let peer = new SimplePeer({ initiator: state.initiator });
    peer.on("error", console.error);
    peer.on("signal", data => {
      wsConn.send(JSON.stringify({
        type: "signal",
        id: state.localId,
        data,
      }));
    });
    peer.on("data", data => onPeerData(id, data));
    state.peerConnections[id] = peer;
  });
}

function signal(id, data) {
  if (state.peerConnections[id]) {
    state.peerConnections[id].signal(data);
  }
}

window.state = state;
window.wsConn = wsConn;
