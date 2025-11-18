import { useEffect, useRef, useCallback, useState } from 'react'
import './styles/Canvas.css';
import Toolbar, { TOOLS } from './ToolBarCanvas';
/* Canvas:
 * - timeline: Timeline object
 * - options: { background, eventRadius, ... } (optional)
 * - onViewportChange: optional callback to communicate viewport to parent (optional)
 */

export default function Canvas({ timeline, options = {}, onViewportChange }) {
  //States -----------------------------------------------------------
   const [activeTool, setActiveTool] = useState(TOOLS.PAN);

  //References--------------------------------------------------------
  const canvasRef = useRef(null);
  let ctxRef = useRef(null);// context
  const viewPort = useRef({ x: 0, y:0 , scale: 1 });

  const dprRef = useRef(window.devicePixelRatio || 1);// 📑 dpr (Device Pixel Ratio) is important because it can affect crispines if the user changes the aplication between screens or zooms in the browser

  // interaction refs
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const activeToolRef = useRef(activeTool);

  // requestFrameAnimation scheduling
  const rafRef = useRef(null);
  const needsRedraw = useRef(true);


  //Canvas configuration settings ------------------------------------
  const cfg = {
    background: options.background || "#fff",
    eventRadius: options.eventRadius || 6,
    tickColor: options.tickColor || "#666",
    yearFont: options.labelFont || "16px sans-serif",
    labelFont: options.labelFont || "12px sans-serif",
    timelineColor: options.timelineColor || "#222",
    labelRenderScale: options.labelRenderScale || 3, //🟡 Look for a way to meake this dinamic so it also deppends on the sixe of the canvas
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
  function normalizedToCanvasX(norm) {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const cssW = canvas.clientWidth;
    const basePad = 40; // 🟡Cambiar por variable de configuración
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
    const trackY = Math.round((canvas.clientHeight / 2 + viewPort.current.y) * viewPort.current.scale)+0.5;//El math y el 0.5 so para que sean más limpias las lineas

    ctx.save();
    //Line
    ctx.lineWidth = 3;
    ctx.strokeStyle = cfg.timelineColor;

    ctx.beginPath();

    const startX = normalizedToCanvasX(0);
    const endX = normalizedToCanvasX(1);

    ctx.moveTo(startX, trackY); 
    ctx.lineTo(endX, trackY);
    ctx.stroke();

    //Text
    ctx.fillStyle = cfg.timelineColor;
    ctx.font = cfg.yearFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const startYear = timeline.anioInicio;  
    const endYear = timeline.anioFin;       

    const textOffset = 8;

    ctx.fillText(startYear, startX, trackY + textOffset);
    ctx.fillText(endYear, endX, trackY + textOffset);

    // Ticks
    ctx.beginPath();
    ctx.moveTo(startX, trackY - 5);
    ctx.lineTo(startX, trackY + 5);

    ctx.moveTo(endX, trackY - 5);
    ctx.lineTo(endX, trackY + 5);

    ctx.stroke()

    drawYearSegments(ctx, trackY);

    //Restaurar
    ctx.restore();

    return trackY;
  }

  //🟡  As of now the years are shown in the Time Line but there is no control over how crowded this can be, is up to the user to set a YearSegment that makes sense with the Time Line.
  function drawYearSegments(ctx, trackY) {
  if (!timeline || !timeline.yearSegments || timeline.yearSegments <= 0) return;

  const currentScale = viewPort.current.scale;
  const startYear = timeline.anioInicio;
  const endYear = timeline.anioFin;
  const segmentInterval = timeline.yearSegments;

  ctx.save();
  ctx.strokeStyle = cfg.tickColor;
  ctx.fillStyle = cfg.tickColor;
  ctx.font = cfg.labelFont;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineWidth = 1;

  const textOffset = 8;
  const tickLength = 5;

  let currentYear = startYear + segmentInterval;

  ctx.beginPath();
  while (currentYear < endYear) {
    const norm = timeline.normalizedPositionForYear(currentYear);
    const x = normalizedToCanvasX(norm);
    
    const sharpX = Math.round(x) + 0.5;

    
    ctx.moveTo(sharpX, trackY - tickLength);
    ctx.lineTo(sharpX, trackY + tickLength);
    
   
    if (currentScale >= cfg.labelRenderScale) {
      ctx.fillText(currentYear, sharpX, trackY + textOffset + tickLength);
    }

    currentYear += segmentInterval;
  }
  ctx.stroke();
  ctx.restore();
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
    const tool = activeToolRef.current;

    if (tool === TOOLS.PAN) {
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      e.target.setPointerCapture?.(e.pointerId);
    }
    else {
      // 🟢 TOOL ACTION START: Handle the start of a drawing action
      console.log(`Tool ${tool} started at: ${e.clientX}, ${e.clientY}`);
    }
  }

  function handlePointerMove(e) {
    const tool = activeToolRef.current;

    if (tool === TOOLS.PAN && dragging.current) {
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      
      viewPort.current.x += dx / viewPort.current.scale;
      viewPort.current.y += dy / viewPort.current.scale;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      scheduleRedraw();
      if (onViewportChange) onViewportChange({ ...viewPort.current });
    } else if (tool !== TOOLS.PAN && dragging.current) {
      // 🟢 TOOL ACTION MOVE: Update preview of the shape being drawn
      // scheduleRedraw(); 
    }
  }

  function handlePointerUp(e) {
    const tool = activeToolRef.current;

    if (tool === TOOLS.PAN) {
      dragging.current = false;
      e.target.releasePointerCapture?.(e.pointerId);
    } else if (tool !== TOOLS.PAN && dragging.current) {
      // 🟢 TOOL ACTION END: Finalize the shape and add it to a list of drawn objects
      // dragging.current = false;
      // e.target.releasePointerCapture?.(e.pointerId);
      console.log(`Tool ${tool} finished at: ${e.clientX}, ${e.clientY}`);
      // dd the new shape/text object to state
      // call scheduleRedraw();
    }
  }

  function handleWheel(e) {
    const tool = activeToolRef.current;

    
    if (e.ctrlKey && tool === TOOLS.PAN) {
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
  }, [resizeCanvasToDisplaySize]);

  // When timeline prop changes (new data), redraw
  useEffect(() => {
    scheduleRedraw();
  }, [timeline?.id, timeline?.events?.length, timeline?.segmentos]);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  console.log("Active tool:", activeTool);
  return (
    <>
    <Toolbar activeTool={activeTool} setActiveTool={setActiveTool}/>
    <canvas
      id="canvas"
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
    />
    </>
    
  );
}

