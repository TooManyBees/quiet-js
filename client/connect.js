const context = {
  roomId: window.location.pathname.substr(1),
  token: null,
  eventSource: null,
  peers: {},
  channels: {},
};

async function getToken() {
  let res = await fetch("/access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  context.token = data.token;
}

function join() {
  return fetch(`/${context.roomId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${context.token}`,
    },
  });
}

const rtcConfig = {
  iceServer: [{
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:global.stun.twilio.com:3478",
    ],
  }],
};

async function connect() {
  await getToken();

  context.eventSource = new EventSource(`/connect?token=${context.token}`);
  context.eventSource.addEventListener("add-peer", addPeer, false);
  context.eventSource.addEventListener("remove-peer", removePeer, false);
  context.eventSource.addEventListener("session-description", sessionDescription, false);
  context.eventSource.addEventListener("ice-candidate", iceCandidate, false);
  context.eventSource.addEventListener("connected", () => join(), false);
}

let needHistory = true;

function addPeer(data) {
  const message = JSON.parse(data.data);
  console.log(message);
  if (context.peers[message.peer.id]) {
    return;
  }

  const peer = new RTCPeerConnection(rtcConfig);
  context.peers[message.peer.id] = peer;

  peer.onicecandidate = function(event) {
    if (event.candidate) {
      relay(message.peer.id, "ice-candidate", event.candidate);
    }
  };

  if (message.offer) {
    const channel = peer.createDataChannel("updates");
    channel.onmessage = function(event) {
      onPeerData(message.peer.id, event.data);
    };
    channel.onopen = function() {
      if (needHistory) {
        channel.send(JSON.stringify({ type: "request-history" }));
      }
    };
    context.channels[message.peer.id] = channel;
    createOffer(message.peer.id, peer);
  } else {
    peer.ondatachannel = function(event) {
      context.channels[message.peer.id] = event.channel;
      event.channel.onmessage = function(evt) {
        onPeerData(message.peer.id, evt.data);
      };
    };
  }
}

function removePeer(data) {
  const message = JSON.parse(data.data);
  if (context.peers[message.peer.id]) {
    context.peers[message.peer.id].close();
  }
  delete context.peers[message.peer.id];
}

async function sessionDescription(data) {
  const message = JSON.parse(data.data);
  const peer = context.peers[message.peer.id];

  const remoteDescription = new RTCSessionDescription(message.data);
  await peer.setRemoteDescription(remoteDescription);
  if (remoteDescription.type === "offer") {
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await relay(message.peer.id, "session-description", answer);
  }
}

function iceCandidate(data) {
  const message = JSON.parse(data.data);
  const peer = context.peers[message.peer.id];
  peer.addIceCandidate(new RTCIceCandidate(message.data));
}

function broadcast(data) {
  for (const peerId in context.channels) {
    context.channels[peerId].send(JSON.stringify(data));
  }
}

function sendMessage(peerId, data) {
  context.channels[peerId].send(JSON.stringify(data));
}

async function relay(peerId, event, data) {
  await fetch(`/relay/${peerId}/${event}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${context.token}`,
    },
    body: JSON.stringify(data),
  });
}

async function createOffer(peerId, peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await relay(peerId, "session-description", offer);
}

connect();
