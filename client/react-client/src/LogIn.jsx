import { useState } from "react";
import "./styles/Login.css";
import { useNavigate } from "react-router-dom";
import { useSession } from "./context/sessionContext"; 

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setSession } = useSession();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const success = await response.json();

      if (success === true) {//Ahora mismo el backend hace una comprobación y devyelve un bool
        setSession({
          type: "user",
          userData: "datos usuario", // cambiar por lo que responda el backend
        });
        navigate("/home");
      } else {
        setError("Invalid username or password");
      }

    } catch (error) {
      setError("Server error");
    }

    
  }

  function handleGuest(e){
    setSession({
      type: "guest",
      userData: null,
    });
    navigate("/timeline")
  }

  return(
      <div className="login-card">
          <h2 className="login-title">
            We are <span className="login-bold">Login</span>
          </h2>

          <div className="login-logo">
            <div className="logo-box">
              <span className="logo-text">L</span>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <input className="login-input" type="text" placeholder="User" value={username} onChange={(e) => setUsername(e.target.value)}/>
            <input className="login-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button className="login-button button" type="submit">
              LOG IN
            </button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button className="guest-button button" onClick={handleGuest}>
              CONTINUAR COMO INVITADO
          </button>
          
      </div>
      //{error && <p style={{ color: "red" }}>{error}</p>} si error true muestra <p style={{ color: "red" }}>{error}</p>
  );
}