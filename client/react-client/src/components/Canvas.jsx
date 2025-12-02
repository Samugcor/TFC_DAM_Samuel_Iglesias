import { useEffect, useRef, useCallback, useState } from 'react'
import '../styles/Canvas.css';
import Toolbar, { TOOLS } from './ToolBarCanvas';


/* Canvas:
 * - timeline: Timeline object
 * - setSelectedEvent: callback to set selected event in TimeLineEditor component
 * - addEvent: callback to add a new event in TimeLineEditor component
 * - options: { background, eventRadius, ... } (optional)
 * - onViewportChange: optional callback to communicate viewport to parent (optional)
 */

const WORLD_TRACK_WIDTH = 1000;
const LINE_WORLD_Y = 500; // Fixed world Y coordinate for the timeline center

export default function Canvas({ timeline, setSelectedEvent, addEvent, options = {}, onViewportChange }) {
  //States -----------------------------------------------------------
   const [activeTool, setActiveTool] = useState(TOOLS.PAN);

  //References--------------------------------------------------------
  const canvasRef = useRef(null);
  let ctxRef = useRef(null);// context
  const viewPort = useRef({ x: 0, y: 0 , scale: 1 }); 

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

    const isInitialRender = viewPort.current.x === 0 && viewPort.current.y === 0 && viewPort.current.scale === 1;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      ctxRef.current = canvas.getContext("2d");
      ctxRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Recalculate center
      if (isInitialRender) {
          const initialPanX = (cssWidth / 2) - (WORLD_TRACK_WIDTH / 2);
          viewPort.current.x = initialPanX;

          const initialPanY = (cssHeight / 2) - (LINE_WORLD_Y / 1);
          viewPort.current.y = initialPanY;
      }

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
  //📑 Difference in normalized, world and canvas cordinates
  function normalizedToCanvasX(norm) {
    const worldX = norm * WORLD_TRACK_WIDTH;
    return (worldX * viewPort.current.scale) + (viewPort.current.x * viewPort.current.scale);
  }
  
  function canvasToNormalizedX(canvasX) {
    const translatedX = canvasX - (viewPort.current.x * viewPort.current.scale);
    const unscaledX = translatedX / viewPort.current.scale;
    const norm = unscaledX / WORLD_TRACK_WIDTH;
    return norm;
  }

  function canvasToWorldX(canvasX) {
    return (canvasX - viewPort.current.x * viewPort.current.scale) / viewPort.current.scale;
  }

  function canvasToWorldY(canvasY) {
    return (canvasY - viewPort.current.y * viewPort.current.scale) / viewPort.current.scale;
  }

  function worldToCanvasX(worldX) {
    return (worldX * viewPort.current.scale) + (viewPort.current.x * viewPort.current.scale);
  }

  function worldToCanvasY(worldY) {
    return (worldY * viewPort.current.scale) + (viewPort.current.y * viewPort.current.scale);
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

    let tLineY = (LINE_WORLD_Y * viewPort.current.scale) + (viewPort.current.y * viewPort.current.scale);
    tLineY = Math.round(tLineY) + 0.5;

    ctx.save();
    //Line
    ctx.lineWidth = 3;
    ctx.strokeStyle = cfg.timelineColor;

    ctx.beginPath();

    const startX = normalizedToCanvasX(0);
    const endX = normalizedToCanvasX(1);

    ctx.moveTo(startX, tLineY); 
    ctx.lineTo(endX, tLineY);
    ctx.stroke();

    //Text
    ctx.fillStyle = cfg.timelineColor;
    ctx.font = cfg.yearFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const startYear = timeline.anioInicio;  
    const endYear = timeline.anioFin;       

    const textOffset = 8;

    ctx.fillText(startYear, startX, tLineY + textOffset);
    ctx.fillText(endYear, endX, tLineY + textOffset);

    // Ticks
    ctx.beginPath();
    ctx.moveTo(startX, tLineY - 5);
    ctx.lineTo(startX, tLineY + 5);

    ctx.moveTo(endX, tLineY - 5);
    ctx.lineTo(endX, tLineY + 5);

    ctx.stroke()

    drawYearSegments(ctx, tLineY);

    //Restaurar
    ctx.restore();

    return tLineY;
  }

  //🟡  As of now the years are shown in the Time Line but there is no control over how crowded this can be, is up to the user to set a YearSegment that makes sense with the Time Line.
  function drawYearSegments(ctx, tLineY) {
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

  const textOffset = 18;
  const tickLength = 5;

  let currentYear = startYear + segmentInterval;

  ctx.beginPath();
  while (currentYear < endYear) {
    const norm = timeline.normalizedPositionForYear(currentYear);
    const x = normalizedToCanvasX(norm);
    
    const sharpX = Math.round(x) + 0.5;

    
    ctx.moveTo(sharpX, tLineY - tickLength);
    ctx.lineTo(sharpX, tLineY + tickLength);
    
   
    if (currentScale >= cfg.labelRenderScale) {
      const textY = tLineY - textOffset - tickLength;
      ctx.fillText(currentYear, sharpX, textY);
    }

    currentYear += segmentInterval;
  }
  ctx.stroke();
  ctx.restore();
}

  function drawEvents(ctx, tLineY) {
    if (!timeline) return;
    const events = timeline.getSortedEvents();
    const drawnLabels = []; 
    const y = tLineY;

    ctx.save();
    ctx.font = cfg.labelFont;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    events.forEach(ev => {
      const norm = timeline.normalizedPositionForYear(ev.year);
      const x = normalizedToCanvasX(norm);

      // marker
      ctx.beginPath();
      ctx.fillStyle = ev.color || "#1976d2";
      ctx.arc(x, y, cfg.eventRadius, 0, Math.PI * 2);
      ctx.fill();

      // label
      const label = ev.title || ev.year;
      const textHeight = parseInt(cfg.labelFont);
      const labelWidth = ctx.measureText(label).width;
      let labelY = y + cfg.eventRadius + 16;
      const buffer = 6;

      // adjust to avoid collisions
      let safe = false;
      while (!safe) {
        safe = true;
        for (const l of drawnLabels) {
          const hBuffer = 10;
          const lLeft = l.x - l.width / 2 - hBuffer;
          const lRight = l.x + l.width / 2 + hBuffer;
          const newLeft = x - labelWidth / 2 - hBuffer;
          const newRight = x + labelWidth / 2 + hBuffer;
          const horizontalOverlap = !(newRight < lLeft || newLeft > lRight);
          const verticalOverlap = Math.abs(l.y - labelY) < textHeight + buffer;

          if (horizontalOverlap && verticalOverlap) {
            labelY = l.y + textHeight + buffer;
            safe = false;
            break;
          }
        }
      }

      // draw label
      ctx.fillStyle = "#111";
      ctx.fillText(label, x, labelY);

      drawnLabels.push({ x, y: labelY, width: labelWidth });
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

    // Apply the CSS to device pixel ratio transform 
    const dpr = dprRef.current;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); 
    
    const tLineY = drawTimelineLine(ctx) || 60;
    drawEvents(ctx, tLineY);
    
    ctx.restore();
  }

  // Draw actions ------------------------------------------------
  // Interaction handlers ----------------------------------------
  function handlePointerDown(e) {
    const tool = activeToolRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    const worldX = canvasToWorldX(canvasX);
    const worldY = canvasToWorldY(canvasY); 

    if (tool === TOOLS.SELECT){
      const events = timeline.getSortedEvents();

      for (const ev of events) {
        const norm = timeline.normalizedPositionForYear(ev.year);
        const evWorldX = norm * WORLD_TRACK_WIDTH;
        const evWorldY = LINE_WORLD_Y;

        // Circle hit test
        const dx = worldX - evWorldX;
        const dy = worldY - evWorldY;
        if (dx * dx + dy * dy <= cfg.eventRadius * cfg.eventRadius) {
          setSelectedEvent(ev);
          return;
        }
      }
      
      return;

    }

    if (tool === TOOLS.PAN) {
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      e.target.setPointerCapture?.(e.pointerId);
    }
    else {
      console.log(`Tool ${tool} started at: ${e.clientX}, ${e.clientY}`);
    }

    if (tool === TOOLS.NEWEVENT) {
      // Convert canvas coordinate → year
      const normX = canvasToNormalizedX(canvasX);
      const year = timeline.yearForNormalizedPosition(normX);  

      addEvent(year);
      setActiveTool(TOOLS.PAN);
      return;
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
      // 🟢 TOOL ACTION MOVE
    }
  }

  function handlePointerUp(e) {
    const tool = activeToolRef.current;

    if (tool === TOOLS.PAN) {
      dragging.current = false;
      e.target.releasePointerCapture?.(e.pointerId);
    } else if (tool !== TOOLS.PAN && dragging.current) {
      // 🟢 TOOL ACTION END
      console.log(`Tool ${tool} finished at: ${e.clientX}, ${e.clientY}`);
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

      // Find world point before zoom
      // WorldPoint = (ScreenPoint - (Translation * Scale)) / Scale
      const unscaledX = (localX - viewPort.current.x * viewPort.current.scale) / viewPort.current.scale;
      const unscaledY = (localY - viewPort.current.y * viewPort.current.scale) / viewPort.current.scale;

      // Zoom factor
      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      let newScale = viewPort.current.scale * zoomFactor;

      // Clamp zoom
      newScale = Math.max(0.3, Math.min(50, newScale));

      // Update scale
      viewPort.current.scale = newScale;

      // Keep the cursor's world point fixed by recalculating the new translation (viewPort.x/y)
      // New Translation = (ScreenPoint - (WorldPoint * NewScale)) / NewScale
      viewPort.current.x = (localX - unscaledX * newScale) / newScale;
      viewPort.current.y = (localY - unscaledY * newScale) / newScale;


      scheduleRedraw();
      if (onViewportChange) onViewportChange({ ...viewPort.current });
    }
  }

 

  // Efectos ------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
  }, [timeline?.id, timeline?.events?.length, timeline?.segmentos, JSON.stringify(timeline?.events)]);

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