import { useEffect, useRef, useState } from 'react'


function Canvas() {

  const canvasRef = useRef(null);
  const viewPort = useRef({ x: 0, y:0 , scale: 1 });

  const [vTData, setVTData] = useState(viewPort.current);

  let ctx = useRef(null);

  const previousX = useRef(0);
  const previousY = useRef(0);  
  let dragging = useRef(false);

  /* 📑APUNTES
  * When your component is added to the DOM, React will run your setup function. 
  * After every re-render with changed dependencies, React will first run the cleanup function (if you provided it) 
  * with the old values, and then run your setup function with the new values. 
  * After your component is removed from the DOM, React will run your cleanup function. 
  * */
  useEffect(()=>{
    // los guardamos en variables porque el DOM ya no está disponible a la hora de desmontar los listeners
    const canvas = canvasRef.current;
    //Necesitamos que los canvas esten cargados en el DOM antes de pedir su contexto.
    ctx.current = canvasRef.current.getContext('2d');
    //Tenemos que usar esta forma de listener porque los que usa react de normal son pasivos, y no nos dejan cancelar el comportamiento predeterminado.
    canvasRef.current.addEventListener("wheel", handleMouseWheel, {passive: false});

    render(ctx.current);

    //La función que limpia cuando se desmonta el componente, aquí deberemos eliminar los listeners que hayamos puesto para que no se dupliquen si se vuelve a montar el componente.
    return () => {
      canvas.removeEventListener("wheel", handleMouseWheel, {passive: false});
    };

  },[]);

  
  //Canvas methods
  const drawRectangle = (ctx, x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height)

  }
  const clearCanvas = (ctx)=>{
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  //Render
  const render = (ctx) =>{
    const vt = viewPort.current;
    clearCanvas(ctx);
    drawRectangle(ctx, toVirtualX(0), toVirtualY(0), 100 * vt.scale, 100 * vt.scale, 'red');
    drawRectangle(ctx, toVirtualX(200), toVirtualY(200), 100 * vt.scale, 100 * vt.scale, 'blue');
  }

  //Conversiones
  const toVirtualX = (x)=>{
    return x * viewPort.current.scale + viewPort.current.x;
  }
  const toVirtualY = (y)=>{
    return y * viewPort.current.scale + viewPort.current.y;
  }
  const toLocalX =(x) => {
    return x / viewPort.current.scale - viewPort.current.x;
  }
  const toLocalY =(y) => {
    return y / viewPort.current.scale - viewPort.current.y;
  }

  //Panning

  const updateVTPanning = (e, vt)=> {
    const localX = e.clientX;  
    const localY = e.clientY;    

    vt.current.x += localX - previousX.current;
    vt.current.y += localY - previousY.current;

    previousX.current = localX;
    previousY.current = localY;

  }

  //Zooming

  const updateVTZooming = (e, vt, canvas) =>{
    const rect = canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;  
    const localY = e.clientY - rect.top;

    const newScale = vt.current.scale * (Math.exp(-e.deltaY * 0.001));
    const newX = localX - (localX - vt.current.x) * (newScale / vt.current.scale);
    const newY = localY - (localY - vt.current.y) * (newScale / vt.current.scale);

    vt.current.x = newX;
    vt.current.y = newY;
    vt.current.scale = newScale;

  }

  //Eventos

  const handleMouseDown = (e) =>{
    dragging.current = true;
    previousX.current= e.clientX;      
    previousY.current= e.clientY;    

    e.target.addEventListener('mousemove', handleMouseMove);
  }

  const handleMouseUp = (e) =>{
    dragging.current = false;
  }

  const handleMouseMove = (e) =>{
    if (!dragging.current) return;

    if (e.target.id == 'canvas') {
      updateVTPanning(e, viewPort);
      render(ctx.current);
      setVTData({...viewPort.current});
    }
    
  }

  const handleMouseWheel = (e) =>{
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.target.id == 'canvas') {
        updateVTZooming(e, viewPort,canvasRef.current);
        render(ctx.current);
        setVTData({...viewPort.current});
      }
    }

  }

  return (
   <canvas id='canvas' ref={canvasRef} width={500} height={500} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} ></canvas>
   
  )
}

export default Canvas