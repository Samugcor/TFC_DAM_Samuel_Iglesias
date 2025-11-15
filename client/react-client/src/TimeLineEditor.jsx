import Canvas from "./Canvas";
import './styles/TimeLineEditor.css';
import { useSession } from "./context/sessionContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import NewTimeLineModal from "./NewTimeLineModal";
import ErrorModal from "./ErrorModal";

import Timeline from "./classes/TimeLine";

export default function TimeLine() {
    const { session } = useSession(); // is a guest or a logged in user?
    const { canvasId } = useParams(); // from /timeline/:canvasId

    const [canvasData, setCanvasData] = useState(null); //datos del canva
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    //Datos de la linea temporal
    useEffect(() => {
        //Deppending on the tipe of user there are two places from where to retrieve the data
        async function retrieveData() {
            setLoading(true);//cuando empezamos una acción asincrona loading is true
            if (session.type === "user") {//Si el usuario está loggeado
                console.log("Usuario registrado");
                if (canvasId) {//Si hay un id de canvas
                    console.log("Id de canvas encontrado, vamos a tratar de recuperarlo");
                     try {
                      const res = await fetch(`/api/canvas/${canvasId}`);
                      if (res.ok) {
                        const data = await res.json();
                        setCanvasData(new Timeline(data));
                      } else {
                        setCanvasData(null);
                        setError(`Server error ${res.status}`);
                      }
                    } catch {
                      setCanvasData(null);
                      setError("No se ha podido conectar con el servidor");
                    }
                } else {
                    console.log("No hay datos de canvas");
                    // new canvas
                    setCanvasData(null);
                }
            }
            else if (session.type === "guest") {
                console.log("Usuario invitado");
                const saved = localStorage.getItem("guestCanvas");
                if (saved){
                    console.log("Se han recuperado datos del navegador");
                    setCanvasData(new Timeline(JSON.parse(saved)));
                } 
                else{
                    console.log("No se han encontrado daros de canvas en el navegador");
                    setCanvasData(null);
                }
            }
            setLoading(false);
        }
        
        retrieveData();   
    }, [session, canvasId]);

    useEffect(() => {
        //Antes de mostrar un modal comprobamos que no estamos cargando datos, que hay datos y que no ha habido un error
        if (!loading && canvasData === null && !error) setShowCreateModal(true);
    }, [canvasData, error, loading]);

    const handleCreateTimeline = (timelineData) => {
        try {
            const newTimeline = new Timeline(timelineData); 

            if (session.type === "guest") {
                localStorage.setItem("guestCanvas", JSON.stringify(newTimeline)); 
            }

            setCanvasData(newTimeline); 
            setShowCreateModal(false); 
        } catch (err) {
            setError(err.message); 
        }
    };


    return(
        <div className="time-line-editor">
            <div className="head">
                name:{session.type}
                {session.type === "guest" && (
                    <button onClick={() => setShowCreateModal(true)}>new timeline</button>
                )}
                {canvasData && (
                  <div className="timeline-info">
                    <p><strong>Timeline:</strong> {canvasData.name}</p>
                    <p>{canvasData.description}</p>
                    <p><em>{canvasData.anioInicio} - {canvasData.anioFin}</em></p>
                  </div>
                )}
            </div>
            <div className="editor-body">
                <div className="canvas-editor">
                    {canvasData ? 
                        (<Canvas timeline={canvasData} options={{ gridSpacing: 80, rulerHeight: 28 }} />) 
                        : 
                        (<div className="empty-placeholder">No timeline selected</div>)
                    }
                </div>
                <div className="event-editor"></div>
            </div>

            {showCreateModal && (
              <NewTimeLineModal
                onCreate={handleCreateTimeline}
                onClose={() => setShowCreateModal(false)}
              />
            )}
            {error && <ErrorModal message={error} onClose={() => setError("")} />}

        </div>
    );
}