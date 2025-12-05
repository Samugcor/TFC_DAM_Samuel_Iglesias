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

import logo from '../assets/logo.svg';

export default function TimeLine() {
    const { session } = useSession(); // is a guest or a logged in user?
    const { canvasId } = useParams(); // from /timeline/:canvasId

    const [timeLine, setTimeLine] = useState(null); //es un objetoTimeline
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    //Modificaciones linea temporal
    const addEvent = (year) => {
      if (!timeLine) {
        console.error("No timeline available to add event to");
        return;
      }
      //console.log("timeLine es una instancia de TimeLine?", timeLine instanceof Timeline);
      

      //console.log("tratando de añadir un evento en el año: ", year);
      const newEvent = new Evento({title: "New Event", year: year});

      const { id, ...rest } = timeLine;
      //console.log("Timeline antes de añadir evento: ", rest);
      const newTimeline = new Timeline({
        ...rest,
        events: [...timeLine.events, newEvent]
      });
      //console.log("Nuevo timeline con el evento añadido: ", newTimeline);
      //console.log(newTimeline instanceof Timeline);

      setTimeLine(newTimeline);
      const selectedEvent = newTimeline.events[newTimeline.events.length - 1]
      //console.log("Evento seleccionado: ", selectedEvent instanceof Evento);
      setSelectedEvent(selectedEvent); 

      if (session.type === "guest") {
        localStorage.setItem("guestCanvas", JSON.stringify(newTimeline.toJSON())); 
      }
      
    };

    const updateEvent = (event) => {
      if (!timeLine) {
        console.error("No timeline available to add event to");
        return;
      }
      //console.log("timeLine es una instancia de TimeLine?", timeLine instanceof Timeline);
      const updatedEvent = new Evento(event);

      const timelineCopy = new Timeline(timeLine.toJSON());
      timelineCopy.id = Timeline.generateId();
      //console.log("Timeline copiado: ", timelineCopy instanceof Timeline);
      //console.log(timelineCopy)
      timelineCopy.updateEvent(updatedEvent);
      //console.log(timelineCopy)
      setTimeLine(timelineCopy);

      if (session.type === "guest") {
        localStorage.setItem("guestCanvas", JSON.stringify(timelineCopy.toJSON())); 
      }
      
    };

    const deleteEvent = (eventId) => {
      if (!timeLine) {
        console.error("No timeline available to delete event from");
        return;
      }

      const timelineCopy = new Timeline(timeLine.toJSON());
      timelineCopy.id = Timeline.generateId();
      timelineCopy.deleteEvent(eventId);
      setTimeLine(timelineCopy);

      if (session.type === "guest") {
        localStorage.setItem("guestCanvas", JSON.stringify(timelineCopy.toJSON())); 
      }

    };

    //Handlers
    const handleCreateTimeline = (timelineData) => {
      try {
        const newTimeline = new Timeline(timelineData);
        //console.log("Nuevo timeline creado: ", newTimeline);
        //console.log(newTimeline instanceof Timeline); 
        if (session.type === "guest") {
            localStorage.setItem("guestCanvas", JSON.stringify(newTimeline.toJSON())); 
        }

        setSelectedEvent(null);
        setTimeLine(newTimeline); 
        //console.log(timeLine instanceof Timeline);
        setShowCreateModal(false);
      } catch (error) {
        setError(`${error.message}`)
      }
      
      
      
    };

    //UseEffects
    useEffect(() => {
        //Deppending on the tipe of user there are two places from where to retrieve the data
        async function retrieveData() {
            setLoading(true);//cuando empezamos una acción asincrona loading is true
            if (session.type === "user") {//Si el usuario está loggeado
                //console.log("Usuario registrado");
                if (canvasId) {//Si hay un id de canvas
                    //console.log("Id de canvas encontrado, vamos a tratar de recuperarlo");
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
                    //console.log("No hay datos de canvas");
                    // new canvas
                    setTimeLine(null);
                }
            }
            else if (session.type === "guest") {
                //console.log("Usuario invitado");
                const saved = localStorage.getItem("guestCanvas");
                if (saved){
                    //console.log("Se han recuperado datos del navegador");
                    setTimeLine(new Timeline(JSON.parse(saved)));
                } 
                else{
                    //console.log("No se han encontrado daros de canvas en el navegador");
                    setTimeLine(null);
                }
            }
            setLoading(false);
        }
        
        retrieveData();   
    }, [session, canvasId]);

    useEffect(() => {
        //Antes de mostrar un modal comprobamos que no estamos cargando datos, que hay datos y que no ha habido un error
        if (!loading && timeLine === null && !error && session.type !== "guest") setShowCreateModal(true);
    }, [timeLine, error, loading]);
    
    //console.log("130", timeLine instanceof Timeline);
    //if (timeLine) {
    //  console.log(timeLine.events);
    //}
    return(
        <div className="time-line-editor">
          <div className="head">
            <div className="logo_container">
              <img src={logo} alt="Lime-Line logo" />
            </div>

            {timeLine && (
              <div className="timeline-info">
                
                <p>Your timeline <strong>{timeLine.name}</strong> goes from <strong>{timeLine.anioInicio}</strong> to <strong>{timeLine.anioFin}</strong>. It has <strong>{timeLine.events.length}</strong> events.</p>
              </div>
            )}
            

            {session.type === "guest" && timeLine && (
              <div style={{display:"flex", gap:"10px"}}>
                <button className="secondary_button lightest" onClick={() => setShowCreateModal(true)}><span>New timeline</span></button>
                <button className="secondary_button dark" ><span>Log in</span></button>
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
                        (<div className="no-timeline">
                            <button className="secondary_button lightest" onClick={() => setShowCreateModal(true)}><span>+ Start timeline</span></button>
                            <button className="secondary_button lightest" ><span>Import timeline</span></button>

                          </div>)
                    }
                </div>
                <div className="event-editor" style={{flex: selectedEvent ? " 0 1 40%" : " 0 1 0"}}>
                    {selectedEvent && (
                        <EventEditor
                          event={selectedEvent}
                          onChange={updateEvent}
                          onDelete={deleteEvent}
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