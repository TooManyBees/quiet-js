export default function(node, tool) {
  /*--------- Begin drawing controls ---------*/
  let lastPoint;

  function drawstart(e) {
    const thisPoint = { x: e.offsetX, y: e.offsetY };
    lastPoint = thisPoint;
    const message = { a: thisPoint, b: thisPoint, weight: e.pressure };
    node.dispatchEvent(new CustomEvent("drawline", {
      detail: message,
    }));

    node.addEventListener("pointermove", drawmove);
    node.addEventListener("pointercancel", drawend);
    node.addEventListener("pointerleave", drawend);
    node.addEventListener("pointerup", drawend);
  }

  function drawmove(e) {
    const thisPoint = { x: e.offsetX, y: e.offsetY };
    if (!lastPoint) {
      lastPoint = thisPoint;
    }
    if (e.buttons) {
      const message = { a: lastPoint, b: thisPoint, weight: e.pressure };
      node.dispatchEvent(new CustomEvent("drawline", {
        detail: message,
      }));
    }
    lastPoint = thisPoint;
  }

  function drawend() {
    node.removeEventListener("pointermove", drawmove);
    node.removeEventListener("pointercancel", drawend);
    node.removeEventListener("pointerleave", drawend);
    node.removeEventListener("pointerup", drawend);
    node.dispatchEvent(new CustomEvent("drawend"));
  }
  /*---------- End drawing controls ----------*/

  /*--------- Begin panning controls ---------*/
  let cursorPanX;
  let cursorPanY;
  let panX = 0;
  let panY = 0;

  function panstart(e) {
    cursorPanX = e.clientX;
    cursorPanY = e.clientY;

    node.addEventListener("pointermove", panmove);
    node.addEventListener("pointercancel", panend);
    node.addEventListener("pointerleave", panend);
    node.addEventListener("pointerup", panend);
  }

  function panmove(e) {
    panX += (e.clientX - cursorPanX);
    panY += (e.clientY - cursorPanY);
    cursorPanX = e.clientX;
    cursorPanY = e.clientY;

    node.dispatchEvent(new CustomEvent("pan", {
      detail: { x: panX, y: panY },
    }));
  }

  function panend() {
    node.removeEventListener("pointermove", panmove);
    node.removeEventListener("pointercancel", panend);
    node.removeEventListener("pointerleave", panend);
    node.removeEventListener("pointerup", panend);
  }
  /*---------- End panning controls ----------*/

  /*---------- Begin zoom controls -----------*/
  function zoom(e) {
    if (e.altKey) {
      node.dispatchEvent(new CustomEvent("zoom-out"));
    } else {
      node.dispatchEvent(new CustomEvent("zoom-in"));
    }
  }
  /*----------- End zoom controls ------------*/

  /*--------- Begin project controls ---------*/
  function placeProject(e) {
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
      return drawstart(e);
    case "zoom":
      return zoom(e);
    case "pan":
      return panstart(e);
    case "project":
      return placeProject(e);
    }
  }

  node.addEventListener("pointerdown", onpointerdown);

  return {
    destroy() {
      node.removeEventListener("pointerdown", onpointerdown);
    },
    update(newTool) {
      tool = newTool;
    }
  }
}
