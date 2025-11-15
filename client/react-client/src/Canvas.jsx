import { useEffect, useRef, useCallback } from 'react'
import './styles/Canvas.css';

/* Canvas:
 * - timeline: Timeline object
 * - options: { background, eventRadius, ... } (optional)
 * - onViewportChange: optional callback to communicate viewport to parent (optional)
 */

export default function Canvas({ timeline, options = {}, onViewportChange }) {

  //References--------------------------------------------------------

  const canvasRef = useRef(null);
  let ctxRef = useRef(null);// context
  const viewPort = useRef({ x: 0, y:0 , scale: 1 });

  const dprRef = useRef(window.devicePixelRatio || 1);// 📑 dpr (Device Pixel Ratio) is important because it can affect crispines if the user changes the aplication between screens or zooms in the browser

  //🟡const [vTData, setVTData] = useState(viewPort.current);

 // interaction refs
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // requestFrameAnimation scheduling
  const rafRef = useRef(null);
  const needsRedraw = useRef(true);

  //Canvas configuration settings ------------------------------------
  const cfg = {
    background: options.background || "#fff",
    eventRadius: options.eventRadius || 6,
    tickColor: options.tickColor || "#666",
    labelFont: options.labelFont || "12px sans-serif",
    timelineColor: options.timelineColor || "#222",
    ...options,
  };

  //Sizing -----------------------------------------------------------
  const resizeCanvasToDisplaySize = useCallback(() => { // 📑 UseCallback: to memoize a function so that it keeps the same reference between renders.
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.floor(rect.width));
    const cssHeight = Math.max(1, Math.floor(rect.height));

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    const displayWidth = Math.floor(cssWidth * dpr);
    const displayHeight = Math.floor(cssHeight * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // set transform so drawing coordinates are in css pixels * dpr
      ctxRef.current = canvas.getContext("2d");
      ctxRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      scheduleRedraw();
    }
  }, []);

  // rAF stuff -------------------------------------------------------
  function scheduleRedraw() {
    needsRedraw.current = true;
    if (rafRef.current == null) {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        if (needsRedraw.current) {
          needsRedraw.current = false;
          draw();
        }
      });
    }
  }

  // Coordinate conversion -------------------------------------------
  //🟡 Hay que revisar todo el tema de los paddings porque no se yo
  function normalizedToCanvasX(norm) {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const cssW = canvas.clientWidth;
    const basePad = 40; // desired padding at scale 1
    const pad = basePad / viewPort.current.scale; // adaptive padding

    const trackW = Math.max(basePad, cssW - basePad * 2 / viewPort.current.scale);
    const x = pad + norm * trackW;

    return (x + viewPort.current.x) * viewPort.current.scale;
  }
  
  function canvasToNormalizedX(canvasX) {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const cssW = canvas.clientWidth;
    const basePad = 40;
    const pad = basePad / viewPort.current.scale; 
    const trackW = Math.max(basePad, cssW - basePad * 2 / viewPort.current.scale);

    const untransformed = canvasX / viewPort.current.scale - viewPort.current.x;
    const norm = (untransformed - pad) / trackW;
    return norm;
  }

  function normalizedToCanvasY(normY) {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const cssH = canvas.clientHeight;
    const basePad = 20; 
    const pad = basePad / viewPort.current.scale; 

    const trackH = Math.max(basePad, cssH - basePad * 2 / viewPort.current.scale);
    const y = pad + normY * trackH;

    return (y + viewPort.current.y) * viewPort.current.scale;
  }

  function canvasToNormalizedY(canvasY) {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const cssH = canvas.clientHeight;
    const basePad = 20;
    const pad = basePad / viewPort.current.scale; 
    const trackH = Math.max(basePad, cssH - basePad * 2 / viewPort.current.scale);

    const untransformed = canvasY / viewPort.current.scale - viewPort.current.y;
    const normY = (untransformed - pad) / trackH;
    return normY;
  }

  // Drawing base -----------------------------------------------------
  function clear(ctx) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform to clear whole buffer
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function drawTimelineLine(ctx) {
    const canvas = canvasRef.current;
    if (!canvas || !timeline) return;
    const trackY = (canvas.clientHeight / 2 + viewPort.current.y) * viewPort.current.scale;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = cfg.timelineColor;
    ctx.beginPath();
    const startX = normalizedToCanvasX(0);
    const endX = normalizedToCanvasX(1);
    ctx.moveTo(startX, trackY);
    ctx.lineTo(endX, trackY);
    ctx.stroke();
    ctx.restore();

    return trackY;
  }

  function drawEvents(ctx, trackY) {
    if (!timeline) return;
    const events = timeline.getSortedEvents();
    ctx.save();
    events.forEach(ev => {
      const norm = timeline.normalizedPositionForYear(ev.year);
      const x = normalizedToCanvasX(norm);
      const y = trackY;
    
      // marker
      ctx.beginPath();
      ctx.fillStyle = ev.color || "#1976d2";
      ctx.arc(x, y, cfg.eventRadius, 0, Math.PI * 2);
      ctx.fill();
    
      // label
      ctx.font = cfg.labelFont;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const label = ev.title || ev.year;
      ctx.fillStyle = "#111";
      ctx.fillText(label, x, y + cfg.eventRadius + 6);
    });
    ctx.restore();
  }

  function draw() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    // clear full buffer (note ctx.setTransform has been set to DPR earlier)
    clear(ctx);

    // background
    const canvas = canvasRef.current;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    ctx.save();
    ctx.fillStyle = cfg.background;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();

    const trackY = drawTimelineLine(ctx) || 60;
    drawEvents(ctx, trackY);
  }

  // Draw actions ------------------------------------------------
  // Interaction handlers ----------------------------------------
  function handlePointerDown(e) {
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    // update viewport: pan uses pixels, but respect scale
    viewPort.current.x += dx / viewPort.current.scale;
    viewPort.current.y += dy / viewPort.current.scale;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    scheduleRedraw();
    if (onViewportChange) onViewportChange({ ...viewPort.current });
  }

  function handlePointerUp(e) {
    dragging.current = false;
    e.target.releasePointerCapture?.(e.pointerId);
  }

  function handleWheel(e) {
    // Zoom only when holding CTRL (as you already designed it)
    if (e.ctrlKey) {
      e.preventDefault();

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      // Cursor position in CSS pixels
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      // Position in world coords before zoom
      const untransformedX = localX / viewPort.current.scale - viewPort.current.x;
      const untransformedY = localY / viewPort.current.scale - viewPort.current.y;

      // Zoom factor
      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      let newScale = viewPort.current.scale * zoomFactor;

      // Clamp zoom
      newScale = Math.max(0.2, Math.min(5, newScale));

      // Update scale
      viewPort.current.scale = newScale;

      // Keep the cursor's world point fixed
      viewPort.current.x = localX / newScale - untransformedX;
      viewPort.current.y = localY / newScale - untransformedY;

      scheduleRedraw();
      if (onViewportChange) onViewportChange({ ...viewPort.current });
    }
  }

  // Efectos ------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d");
    ctxRef.current.setTransform(1, 0, 0, 1, 0, 0);

    // pointer events
    canvas.style.touchAction = "none"; // disable all default behaviour for touch
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // Observe size changes of the parent container
    const ro = new ResizeObserver(() => {
      resizeCanvasToDisplaySize();
    });
    ro.observe(canvas.parentElement || canvas);

    // initial sizing
    resizeCanvasToDisplaySize();

    // initial draw
    scheduleRedraw();

    //Cleanup function
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      ro.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [resizeCanvasToDisplaySize]); // runs once

  // When timeline prop changes (new data), redraw
  useEffect(() => {
    scheduleRedraw();
  }, [timeline?.id, timeline?.events?.length, timeline?.segmentos]);


  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
    />
  );
}

