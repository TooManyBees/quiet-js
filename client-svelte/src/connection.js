import { readable, writable, derived, get } from "svelte/store";

// const roomId = window.location.pathname.substr(1);
const roomId = "test-room";
let token = null;
let eventSource = null;
const channels = {};

const peersWritable = writable({});
export const peers = derived(peersWritable, p => p);

async function getToken() {
  let res = await fetch("http://localhost:8888/access", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomId }),
  });
  const data = await res.json();
  token = data.token;
}

function join() {
  return fetch(`http://localhost:8888/${roomId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
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

let needHistory = true;

function addPeer(data, onPeerData) {
  const message = JSON.parse(data.data);
  if (get(peersWritable)[message.peer.id]) {
    return;
  }

  const peer = new RTCPeerConnection(rtcConfig);
  peersWritable.update(peers => {
    peers[message.peer.id] = peer;
    return peers;
  });

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
      onPeerData(message.peer.id, JSON.stringify({ type: 'new-connection'}));
      // if (needHistory) {
      //   channel.send(JSON.stringify({ type: "request-history" }));
      // }
    };
    channels[message.peer.id] = channel;
    createOffer(message.peer.id, peer);
  } else {
    peer.ondatachannel = function(event) {
      channels[message.peer.id] = event.channel;
      event.channel.onmessage = function(evt) {
        onPeerData(message.peer.id, evt.data);
      };
    };
  }
}

function removePeer(data) {
  const message = JSON.parse(data.data);
  if (get(peersWritable)[message.peerId]) {
    peersWritable.update(peers => {
      peers[message.peerId].close();
      delete peers[message.peerId];
      return peers;
    });
  }
}

async function sessionDescription(data) {
  const message = JSON.parse(data.data);
  const peer = get(peersWritable)[message.peer.id];

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
  const peer = get(peersWritable)[message.peer.id];
  peer.addIceCandidate(new RTCIceCandidate(message.data));
}

export function broadcast(data) {
  for (const peerId in channels) {
    channels[peerId].send(JSON.stringify(data));
  }
}

export function sendMessage(peerId, data) {
  channels[peerId].send(JSON.stringify(data));
}

async function relay(peerId, event, data) {
  await fetch(`http://localhost:8888/relay/${peerId}/${event}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

async function createOffer(peerId, peer) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await relay(peerId, "session-description", offer);
}

export async function connect(onPeerData) {
  await getToken();

  eventSource = new EventSource(`http://localhost:8888/connect?token=${token}`);
  eventSource.addEventListener("add-peer", (peer) => addPeer(peer, onPeerData), false);
  eventSource.addEventListener("remove-peer", removePeer, false);
  eventSource.addEventListener("session-description", sessionDescription, false);
  eventSource.addEventListener("ice-candidate", iceCandidate, false);
  eventSource.addEventListener("connected", () => join(), false);
}
