import Canvas from "./Canvas";
import '../styles/TimeLineEditor.css';
import { useSession } from "../context/sessionContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import NewTimeLineModal from "./NewTimeLineModal";
import ErrorModal from "./ErrorModal";

import Timeline from "../classes/TimeLine";
import Evento from "../classes/Evento";
import EventEditor from "./EventEditor";

export default function TimeLine() {
    const { session } = useSession(); // is a guest or a logged in user?
    const { canvasId } = useParams(); // from /timeline/:canvasId

    const [timeLine, setTimeLine] = useState(null); 
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    //Modificaciones linea temporal
    const addEvent = (year) => {
      const newEvent = new Evento({ title: "New Event", year, description: "" });
      timeLine.addEvent(newEvent);
      setTimeLine(new Timeline(  timeLine.toJSON())); // trigger rerender
      setSelectedEvent(newEvent);
        
      // persist
      if (session.type === "guest") {
        localStorage.setItem("guestCanvas", JSON.stringify(timeLine.toJSON()));
      } else if (session.type === "user" && timeLine.id) {
        //fetch(`/api/canvas/${timeLine.id}`, {
        //  method: "PUT",
        //  headers: { "Content-Type": "application/json" },
        //  body: JSON.stringify(timeLine),
        //});
      }
    };

    const updateEvent = (updatedEvent) => {
      timeLine.updateEvent(updatedEvent); 
      const newTL = new Timeline(  timeLine.toJSON());
      setTimeLine(newTL); // trigger rerender
      setSelectedEvent(updatedEvent);
      
      if (session.type === "guest") {
        localStorage.setItem("guestCanvas", JSON.stringify(newTL.toJSON()));
      }
    }

    //Handlers
    const handleCreateTimeline = (timelineData) => {
      const newTimeline = new Timeline(timelineData); 
      
      if (session.type === "guest") {
          localStorage.setItem("guestCanvas", JSON.stringify(newTimeline.toJSON())); 
      }
      
      setSelectedEvent(null);
      setTimeLine(newTimeline); 
      setShowCreateModal(false);
    };

    //UseEffects
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
                        setTimeLine(new Timeline(data));
                      } else {
                        setTimeLine(null);
                        setError(`Server error ${res.status}`);
                      }
                    } catch {
                      setTimeLine(null);
                      setError("No se ha podido conectar con el servidor");
                    }
                } else {
                    console.log("No hay datos de canvas");
                    // new canvas
                    setTimeLine(null);
                }
            }
            else if (session.type === "guest") {
                console.log("Usuario invitado");
                const saved = localStorage.getItem("guestCanvas");
                if (saved){
                    console.log("Se han recuperado datos del navegador");
                    setTimeLine(new Timeline(JSON.parse(saved)));
                } 
                else{
                    console.log("No se han encontrado daros de canvas en el navegador");
                    setTimeLine(null);
                }
            }
            setLoading(false);
        }
        
        retrieveData();   
    }, [session, canvasId]);

    useEffect(() => {
        //Antes de mostrar un modal comprobamos que no estamos cargando datos, que hay datos y que no ha habido un error
        if (!loading && timeLine === null && !error) setShowCreateModal(true);
    }, [timeLine, error, loading]);
    
    console.log("t is t",timeLine instanceof Timeline);
    if (timeLine) {
        console.log(timeLine.printEvents());
    }
    console.log("se is e",selectedEvent instanceof Evento);
    if (selectedEvent) {
        console.log(selectedEvent);
    }
    //console.log(timeLine.printEvents());
    return(
        <div className="time-line-editor">
            <div className="head">
                name:{session.type}
                {session.type === "guest" && (
                    <button onClick={() => setShowCreateModal(true)}>new timeline</button>
                )}
                {timeLine && (
                  <div className="timeline-info">
                    <p><strong>Timeline:</strong> {timeLine.name}</p>
                    <p>{timeLine.description}</p>
                    <p><em>{timeLine.anioInicio} - {timeLine.anioFin}</em></p>
                  </div>
                )}
            </div>
            <div className="editor-body">
                <div className="canvas-editor">
                    {timeLine ? 
                        (<Canvas 
                          key={timeLine?.id}
                          timeline={timeLine} 
                          setSelectedEvent={setSelectedEvent} 
                          addEvent={addEvent}
                        />) 
                        : 
                        (<div className="empty-placeholder">No timeline selected</div>)
                    }
                </div>
                <div className="event-editor" style={{flex: selectedEvent ? " 0 1 40%" : " 0 1 0"}}>
                    {selectedEvent && (
                        <EventEditor
                          event={selectedEvent}
                          onChange={updateEvent}
                          onClose={() => setSelectedEvent(null)}
                        />
                    )}
                </div>
                
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