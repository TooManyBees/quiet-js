<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";

  let canvas;
  let context;
  let drawQueue = [];
  let queueTimeout = null;
  const QUEUE_INTERVAL = 1000;
  let lastPoint;

  export let width = 300;
  export let height = 300;

  const dispatch = createEventDispatcher();

  export function draw(points) {
    for (const point of points) {
      drawPoint(point);
    }
  }

  export function getState() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = imageData.data.every(b => b === 0);
    return {
      width: imageData.width,
      height: imageData.height,
      bytes: isEmpty ? [] : Array.from(imageData.data),
    };
  }

  export function setState(state) {
    const { width, height, bytes } = state;
    canvas.width = width;
    canvas.height = height;
    if (bytes.length > 0) {
      const imageData = new ImageData(Uint8ClampedArray.from(bytes), width, height);
      context.putImageData(imageData, 0, 0);
    }
  }

  function flushQueue(end) {
    if (drawQueue.length === 0) {
      console.warn("Canvas::flushQueue called with 0 points, possibly stuck in a loop, stopping now");
      clearTimeout(queueTimeout);
      return;
    }
    dispatch("drawmulti", { points: drawQueue });
    drawQueue = [];
    if (!end) {
      queueTimeout = setTimeout(flushQueue, QUEUE_INTERVAL);
    }
  }

  function queueDrawing(message) {
    drawQueue.push(message);
    if (queueTimeout == null) {
      queueTimeout = setTimeout(flushQueue, QUEUE_INTERVAL);
    }
  }

  function endDrawing() {
    if (queueTimeout && drawQueue.length > 0) {
      clearTimeout(queueTimeout);
      queueTimeout = null;
      flushQueue(true);
    }
  }

  function drawPoint({ a, b, weight }) {
    context.strokeStyle = "red",
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.lineWidth = 10 * weight;
    context.lineCap = "round";
    context.stroke();
  }

  function onpointermove(e) {
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
  }

  function onpointerdown(e) {
    const thisPoint = { x: e.offsetX, y: e.offsetY };
    const message = { a: thisPoint, b: thisPoint, weight: e.pressure };
    drawPoint(message);
    queueDrawing(message);
  }

  onMount(() => {
    context = canvas.getContext("2d");
    canvas.onpointermove = onpointermove;
    canvas.onpointerdown = onpointerdown;
    canvas.onpointercancel = endDrawing;
    canvas.onpointerleave = endDrawing;
    canvas.onpointerup = endDrawing;
  });

  onDestroy(() => {
    clearTimeout(queueTimeout);
  });
</script>

<style>
  canvas {
    outline: 1px solid red;
  }
</style>

<canvas width={width} height={height} bind:this={canvas}></canvas>
