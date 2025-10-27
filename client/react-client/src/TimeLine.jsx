import Canvas from "./Canvas";
import './styles/TimeLine.css';
import { useSession } from "./context/sessionContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TimeLine() {
    const { session } = useSession();
    const { canvasId } = useParams(); // from /timeline/:canvasId
    const [canvasData, setCanvasData] = useState(null);

    useEffect(() => {
        // 1️⃣ Logged-in user
        if (session.type === "user") {
            if (canvasId) {
                // existing canvas → fetch from server
                fetch(`/api/canvas/${canvasId}`)
                  .then((res) => res.json())
                  .then(setCanvasData)
                  .catch(() => setCanvasData(null));
            } else {
                // new canvas
                setCanvasData(null);
            }
        }
      
        // 2️⃣ Guest user
        else if (session.type === "guest") {
            const saved = localStorage.getItem("guestCanvas");
            if (saved) setCanvasData(JSON.parse(saved));
            else setCanvasData(null);
        }
    }, [session, canvasId]);

    return(
        <div className="time-line-editor">
            <div className="head">
                name:{session.type}
            </div>
            <div className="editor-body">
                <div className="canvas-editor">
                    <Canvas></Canvas>
                </div>
                <div className="event-editor"></div>
            </div>
        </div>
    );
}