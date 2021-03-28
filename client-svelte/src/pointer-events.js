export default function() {
  let panX = 0;
  let panY = 0;
  let zoomLevel = 1;
  let node;
  let canvas;

  function fireTransformEvent() {
    node.dispatchEvent(new CustomEvent("transform", {
      detail: { x: panX, y: panY, scale: zoomLevel },
    }));
  }

  return {
    pointerEvents: function(thisNode, { tool, canvasX, canvasY }) {
      node = thisNode;
      canvas = node.querySelector("canvas");
      const pointerCache = [];
      function addPointer(e) {
        const idx = pointerCache.findIndex(p => p.pointerId === e.pointerId);
        // Event's properties aren't guaranteed to persist, so
        // cache an object of the fields we're interested in, rather
        // than caching the event itself.
        const pointerMessage = {
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          clientX: e.clientX,
          clientY: e.clientY,
          pointerId: e.pointerId,
          target: e.target,
        };
        if (idx > -1) {
          pointerCache[idx] = pointerMessage;
        } else {
          pointerCache.push(pointerMessage);
        }
      }
      function getPointer(e) {
        return pointerCache.find(p => p.pointerId === e.pointerId) || null;
      }
      function removePointer(e) {
        const idx = pointerCache.find(p => p.pointerId === e.pointerId);
        if (idx) {
          pointerCache.splice(idx, 1);
        }
      }

      /*--------- Begin drawing controls ---------*/

      function drawstart(e, mode) {
        if (e.target !== canvas) return;
        addPointer(e);
        const thisPoint = pointOnCanvas(e);
        const message = { a: thisPoint, b: thisPoint, weight: e.pressure, mode };
        node.dispatchEvent(new CustomEvent("drawline", {
          detail: message,
        }));
      }

      function pointOnCanvas(e) {
        if (e.target === canvas) {
          return { x: e.offsetX, y: e.offsetY };
        } else {
          // Close enough!
          return {
            x: e.clientX - canvasX + canvas.width/2,
            y: e.clientY - canvasY + canvas.height/2,
          };
        }
      }

      function drawmove(e, mode) {
        if (e.target !== canvas) return;
        const lastE = getPointer(e) || e;
        const thisPoint = pointOnCanvas(e);
        const lastPoint = pointOnCanvas(lastE);
        const message = { a: lastPoint, b: thisPoint, weight: e.pressure, mode };
        node.dispatchEvent(new CustomEvent("drawline", {
          detail: message,
        }));
        addPointer(e);
      }

      function drawend(e, mode) {
        removePointer(e);
        node.dispatchEvent(new CustomEvent(`drawend`, {
          detail: { mode },
        }));
      }
      /*---------- End drawing controls ----------*/

      let pointerDist;

      /*-------- Begin transform controls --------*/

      function zoomFromOrigin(x, y, pixels) {
        const nodeSize = canvas.width;
        const scale = -1 * pixels / nodeSize;
        zoomLevel = Math.max(0.01, zoomLevel * (1 + scale));
        panX += (canvasX - x) * scale;
        panY += (canvasY - y) * scale;
      }

      function pointerDistance(p1, p2) {
        // For now, distance squared
        return Math.pow(p1.clientX - p2.clientX, 2) + Math.pow(p1.clientY - p2.clientY, 2);
      }

      function transformstart(e) {
        addPointer(e);
        if (pointerCache.length === 2) {
          pointerDist = pointerDistance(pointerCache[0], pointerCache[1]);
        }
      }

      function transformmove(e) {
        if (pointerCache.length === 1) {
          const lastPointer = getPointer(e);
          panX += e.clientX - lastPointer.clientX;
          panY += e.clientY - lastPointer.clientY;
          addPointer(e);
        } else if (pointerCache.length > 1) {
          const p1 = pointerCache[0];
          const p2 = pointerCache[1];
          const newDist = pointerDistance(p1, p2);
          zoomLevel = Math.max(0.01, zoomLevel * (newDist / pointerDist));
          pointerDist = newDist;
        }
        fireTransformEvent();
        event.preventDefault();
      }

      function transformend(e) {
        removePointer(e);
        if (pointerCache.length > 1) {
          pointerDist = pointerDistance(pointerCache[0], pointerCache[1]);
        }
      }

      /*--------- End transform controls ---------*/

      /*---------- Begin zoom controls -----------*/
      function zoom(e) {
        if (e.altKey) {
          zoomFromOrigin(e.clientX, e.clientY, canvas.width / 3);
        } else {
          zoomFromOrigin(e.clientX, e.clientY, canvas.width * -0.5);
        }
        fireTransformEvent();
      }
      /*----------- End zoom controls ------------*/

      /*--------- Begin project controls ---------*/
      function placeProject(e) {
        if (e.target !== canvas) return;
        const x = e.offsetX;
        const y = e.offsetY;
        node.dispatchEvent(new CustomEvent("place-project", {
          detail: { x, y },
        }));
      }
      /*---------- End project controls ----------*/

      function onpointerdown(e) {
        switch (tool) {
        case "draw":
          return drawstart(e, "draw");
        case "erase":
          return drawstart(e, "erase");
        case "zoom":
          return zoom(e);
        case "pan":
          return transformstart(e);
        case "project":
          return placeProject(e);
        }
      }
      node.addEventListener("pointerdown", onpointerdown);

      function onpointermove(e) {
        switch (tool) {
          case "draw":
            if (e.buttons) {
              return drawmove(e, "draw");
            }
            break;
          case "erase":
            if (e.buttons) {
              return drawmove(e, "erase");
            }
            break;
          case "pan":
            if (e.buttons) {
              return transformmove(e);
            }
            break;
        }
      }
      node.addEventListener("pointermove", onpointermove);

      function onpointerup(e) {
        switch (tool) {
          case "draw":
            return drawend(e, "draw");
          case "erase":
            return drawend(e, "erase");
          case "pan":
            return transformend(e);
        }
      }
      node.addEventListener("pointercancel", onpointerup);
      node.addEventListener("pointerleave", onpointerup);
      node.addEventListener("pointerup", onpointerup);

      function onwheel(e) {
        e.preventDefault();

        const isZoom = e.ctrlKey;

        if (isZoom) {
          switch (e.deltaMode) {
          case WheelEvent.DOM_DELTA_PIXEL:
            zoomFromOrigin(e.clientX, e.clientY, e.deltaY * 4);
            break;
          case WheelEvent.DOM_DELTA_LINE:
            zoomFromOrigin(e.clientX, e.clientY, e.deltaY * 16);
            break;
          default:
          }
        } else {
          switch (e.deltaMode) {
          case WheelEvent.DOM_DELTA_PIXEL:
            panX -= e.deltaX;
            panY -= e.deltaY;
            break;
          case WheelEvent.DOM_DELTA_LINE:
            panX -= e.deltaX * 16;
            panY -= e.deltaY * 16;
            break;
          default:
          }
        }

        fireTransformEvent();
      }
      node.addEventListener("wheel", onwheel, { passive: false });

      return {
        destroy() {
          node.removeEventListener("pointerdown", onpointerdown);
          node.removeEventListener("pointercancel", onpointerup);
          node.removeEventListener("pointerleave", onpointerup);
          node.removeEventListener("pointerup", onpointerup);
          node.removeEventListener("wheel", onwheel);
        },
        update({ tool: newTool, canvasX: newCanvasX, canvasY: newCanvasY }) {
          tool = newTool;
          canvasX = newCanvasX;
          canvasY = newCanvasY;
        }
      }
    },
    fitToWindow: function() {
      zoomLevel = Math.min(
        (window.innerWidth - 32) / canvas.width,
        (window.innerHeight - 128) / canvas.height,
      );
      fireTransformEvent();
    },
  }
}
