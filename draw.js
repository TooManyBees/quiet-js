const cavas = document.getElementById('canvas');

const state = {
  canvas,
  context: canvas.getContext("2d"),
  localId: undefined,
  peerIds: [],
  peerConnections: {},
  initiator: false,
  drawQueue: [],
};

let queueTimeout = null;
const QUEUE_INTERVAL = 1000;

function flushQueue(end) {
  broadcast({ type: "drawMulti", points: state.drawQueue });
  state.drawQueue = [];
  if (!end) {
    queueTimeout = setTimeout(flushQueue, QUEUE_INTERVAL);
  }
}

function queueDrawing(message) {
  state.drawQueue.push(message);
  if (queueTimeout == null) {
    queueTimeout = setTimeout(flushQueue, QUEUE_INTERVAL);
  }
}

function endDrawing() {
  if (queueTimeout && state.drawQueue.length > 0) {
    clearTimeout(queueTimeout);
    queueTimeout = null;
    flushQueue(true);
  }
}

let lastPoint;
function drawPoint({ a, b, weight }) {
  state.context.strokeStyle = "red",
  state.context.beginPath();
  state.context.moveTo(a.x, a.y);
  state.context.lineTo(b.x, b.y);
  state.context.lineWidth = 10 * weight;
  state.context.lineCap = "round";
  state.context.stroke();
}
canvas.onpointermove = function(e) {
  const thisPoint = { x: e.offsetX, y: e.offsetY };
  if (!lastPoint) {
    lastPoint = thisPoint;
  }
  const message = { a: lastPoint, b: thisPoint, weight: e.pressure };
  if (e.buttons) {
    drawPoint(message);
    queueDrawing(message);
  }
  lastPoint = thisPoint;
};
canvas.onpointerdown = function(e) {
  const thisPoint = { x: e.offsetX, y: e.offsetY };
  const message = { a: thisPoint, b: thisPoint, weight: e.pressure };
  drawPoint(message);
  queueDrawing(message);
};

canvas.onpointercancel = endDrawing;
canvas.onpointerleave = endDrawing;
canvas.onpointerup = endDrawing;

function onPeerData(id, buffer) {
  const data = JSON.parse(buffer);
  switch (data.type) {
    case "draw":
      drawPoint(data.p);
      break;
    case "drawMulti":
      for (const p of data.points) {
        drawPoint(p);
      }
      break;
    default:
      console.log(`Unknown message from ${id}`, data);
  }
}
