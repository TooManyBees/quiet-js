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
function drawPoint(a, b) {
  state.context.strokeStyle = "red",
  state.context.beginPath();
  state.context.moveTo(a.x, a.y);
  state.context.lineTo(b.x, b.y);
  state.context.lineWidth = 5;
  state.context.lineCap = "round";
  state.context.stroke();
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
  broadcast({ type: "draw", from: thisPoint, to: thisPoint });
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
