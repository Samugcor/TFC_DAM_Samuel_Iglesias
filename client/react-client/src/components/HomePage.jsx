import { useNavigate } from "react-router-dom";
import { useSession } from "../context/sessionContext";


export default function HomePage() {
    const navigate = useNavigate();
    const { session } = useSession();

    function handleGuest(e){
      
      navigate("/timeline")
    }
    return(
        <div className="homepage">
            <div>
                Welcome {session.type}
            </div>
            <button className="guest-button button" onClick={handleGuest}>
                  Nueva timeline
            </button>
        </div>
    );
}