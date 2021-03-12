<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import Project from "./Project.svelte";
  import pointerEvents from "./pointer-events.js";

  const EXPANSION = 256;

  export let width = 256;
  export let height = 256;
  export let tool;
  export let projects = [];

  let canvas;
  let context;
  let drawQueue = [];
  let queueTimeout = null;
  const QUEUE_INTERVAL = 1000;
  let lastPoint;

  let cursor = "pointer";
  let altKey = false;
  $: switch (tool) {
    case "draw":
      cursor = "crosshair";
      break;
    case "zoom":
      if (altKey) {
        cursor = "zoom-out";
      } else {
        cursor = "zoom-in";
      }
      break;
    case "pan":
      cursor = "grab";
      break;
    default:
      cursor = "default";
      break;
  }

  function handleKeydown(e) {
    if (e.key === "Alt") {
      altKey = true;
    }
  }

  function handleKeyup(e) {
    if (e.key === "Alt") {
      altKey = false;
    }
  }

  const dispatch = createEventDispatcher();

  export function draw(points) {
    for (const point of points) {
      drawLine(point);
    }
  }

  export function getState() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = imageData.data.every(b => b === 0);
    return {
      width: imageData.width,
      height: imageData.height,
      bytes: isEmpty ? new Uint8ClampedArray : imageData.data,
    };
  }

  export function setBytes(width, height, bytes) {
    if (bytes.byteLength > 0) {
      const expectedByteLength = canvas.width * canvas.height * 4;
      if (expectedByteLength !== bytes.byteLength) {
        canvas.width = width;
        canvas.height = height;
      }
      const imageData = new ImageData(new Uint8ClampedArray(bytes), canvas.width, canvas.height);
      context.putImageData(imageData, 0, 0);
    }
  }

  export function expand() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const width = Math.floor(canvas.width + EXPANSION);
    const height = Math.floor(canvas.height + EXPANSION);
    const marginX = Math.floor((width - canvas.width) / 2);
    const marginY = Math.floor((height - canvas.height) / 2);

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(imageData, marginX, marginY);
    return { width, height };
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

  function handleDrawEnd() {
    if (queueTimeout && drawQueue.length > 0) {
      clearTimeout(queueTimeout);
      queueTimeout = null;
      flushQueue(true);
    }
  }

  function drawLine({ a, b, weight }) {
    context.strokeStyle = "red",
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.lineWidth = 10 * weight;
    context.lineCap = "round";
    context.stroke();
  }

  function handleDrawLine(event) {
    drawLine(event.detail);
    queueDrawing(event.detail);
  }

  let windowWidth;
  let windowHeight;
  let panX = 0;
  let panY = 0;
  $: canvasX = windowWidth / 2 + panX;
  $: canvasY = windowHeight / 2 + panY;

  function handlePan(event) {
    panX = event.detail.x;
    panY = event.detail.y;
  }

  let zoom = 1.0;

  function handleZoomIn() {
    zoom = zoom * 1.5;
  }

  function handleZoomOut() {
    zoom = zoom / 1.5;
  }

  function handlePlaceProject(event) {
    const x = event.detail.x - canvas.width / 2;
    const y = event.detail.y - canvas.height / 2;
    dispatch("place-project", { ...event.detail, x, y });
  }

  onMount(() => {
    context = canvas.getContext("2d");
  });

  onDestroy(() => {
    clearTimeout(queueTimeout);
  });
</script>

<style>
  .wrapper {
    display: inline-flex;
    position: relative;
    transform: translate(-50%, -50%);
  }
  canvas {
    background-color: white;
    outline: 20px solid #eee;
  }
</style>

<svelte:window
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
  on:keydown={handleKeydown}
  on:keyup={handleKeyup}
/>

<div
  class="wrapper"
  style={`
    left: ${canvasX}px;
    top: ${canvasY}px;
    transform: translate(-50%, -50%) scale(${zoom});
  `}>
  <canvas
    width={width}
    height={height}
    bind:this={canvas}
    use:pointerEvents={tool}
    on:drawline={handleDrawLine}
    on:drawend={handleDrawEnd}
    on:pan={handlePan}
    on:zoom-in={handleZoomIn}
    on:zoom-out={handleZoomOut}
    on:place-project={handlePlaceProject}
    style={`cursor: ${cursor};`}
  ></canvas>
  {#each projects as project}
    <Project {...project} />
  {/each}
</div>
