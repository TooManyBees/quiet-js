import { readable, writable, derived, get } from "svelte/store";
import { getSessionToken, setSessionToken } from "./storage.js";
import pako from "pako";

export const roomId = window.location.pathname.split("/").slice(-1)[0];
let token = null;
let eventSource = null;
const channels = {};

const peersWritable = writable({});
export const peerIds = derived(peersWritable, p => Object.keys(p));
const userIdWritable = writable(null);
export const userId = derived(userIdWritable, u => u);
const userIdsWritable = writable([]);
export const userIds = derived(userIdsWritable, l => l);

async function getToken() {
  let data = getSessionToken();
  if (!data) {
    const res = await fetch("/api/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId }),
    });
    data = await res.json();
    setSessionToken(data);
  }
  token = data.token;
  userIdWritable.set(data.userId);
}

function join() {
  return fetch(`/api/${roomId}/join`, {
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

function addPeer(event, onPeerData) {
  const message = JSON.parse(event.data);
  if (get(peersWritable)[message.peer.id]) {
    return;
  }

  function onRawPeerData(peerId, buffer) {
    let data;
    try {
      data = JSON.parse(buffer);
    } catch (e) {
      console.error(`Error parsing JSON`, buffer);
    }
    return onPeerData(peerId, data);
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

  if (message.offer) { // If client running this JS is new
    const channel = peer.createDataChannel("updates");
    channel.onmessage = function(event) {
      onRawPeerData(message.peer.id, event.data);
    };
    channel.onopen = function() {
      userIdsWritable.set(message.userIds);
      onPeerData(message.peer.id, { type: "new-connection" });
    };
    channels[message.peer.id] = channel;
    createOffer(message.peer.id, peer);
  } else {
    peer.ondatachannel = function(event) {
      channels[message.peer.id] = event.channel;
      event.channel.onmessage = function(evt) {
        onRawPeerData(message.peer.id, evt.data);
      };
      userIdsWritable.set(message.userIds);
      onPeerData(message.peer.id, { type: "introduce-yourself" });
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
  delete channels[message.peerId];
  userIdsWritable.set(message.userIds);
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
  console.debug("send", data);
  channels[peerId].send(JSON.stringify(data));
}

async function relay(peerId, event, data) {
  await fetch(`/api/relay/${peerId}/${event}`, {
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

export async function requestCanvas() {
  const response = await fetch("/api/canvas-data/", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  })
  const body = await response.arrayBuffer();
  const inflated = body.byteLength > 0 ? pako.inflate(body) : body;
  return inflated;
}

export async function sendCanvas(id, body) {
  const deflated = body.length > 0 ? pako.deflate(body) : body;
  return fetch(`/api/canvas-data/${id}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Encoding": "deflate",
    },
    body: deflated,
  });
}

export async function connect(onPeerData) {
  await getToken();

  eventSource = new EventSource(`/api/connect?token=${token}`);
  eventSource.addEventListener("add-peer", (event) => addPeer(event, onPeerData), false);
  eventSource.addEventListener("remove-peer", removePeer, false);
  eventSource.addEventListener("session-description", sessionDescription, false);
  eventSource.addEventListener("ice-candidate", iceCandidate, false);
  eventSource.addEventListener("connected", () => join(), false);
  eventSource.addEventListener("send-canvas-data", (event) => {
    onPeerData(JSON.parse(event.data), { type: "send-canvas-data" });
  });
}
