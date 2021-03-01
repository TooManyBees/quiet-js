const cavas = document.getElementById('canvas');

const state = {
  canvas,
  context: canvas.getContext("2d"),
  localId: undefined,
  peerIds: [],
  peerConnections: {},
  initiator: false,
};

let lastPoint;
function drawPoint(a, b, weight) {
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
  if (e.buttons) {
    drawPoint(lastPoint, thisPoint, e.pressure);
    broadcast({ type: "draw", from: lastPoint, to: thisPoint, weight: e.pressure });
  }
  lastPoint = thisPoint;
};
canvas.onpointerdown = function(e) {
  const thisPoint = { x: e.offsetX, y: e.offsetY };
  drawPoint(thisPoint, thisPoint, e.pressure);
  broadcast({ type: "draw", from: thisPoint, to: thisPoint, weight: e.pressure });
};

function onPeerData(id, buffer) {
  const data = JSON.parse(buffer);
  switch (data.type) {
    case "draw":
      drawPoint(data.from, data.to, data.weight);
      break;
    default:
      console.log(`Unknown message from ${id}`, data);
  }
}
