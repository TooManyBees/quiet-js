import pako from "pako";

onmessage = function(e) {
  const { type, bytes } = e.data;
  switch (type) {
    case "deflate":
      const deflated = pako.deflate(bytes);
      postMessage(deflated);
      break;
    case "inflate":
      const inflated = pako.inflate(bytes);
      postMessage(inflated);
      break;
    default:
      console.warn(`Unrecognized deflate action: ${type}`);
      break;
  }
}
