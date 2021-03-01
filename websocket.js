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
