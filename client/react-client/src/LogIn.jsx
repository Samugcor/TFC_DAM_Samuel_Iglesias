import { useState } from "react";
import "./styles/Login.css";
import { useNavigate } from "react-router-dom";

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const success = await response.json();

      if (success) {
        navigate("/home");
      } else {
        setError("Invalid username or password");
      }

    } catch (error) {
      setError("Server error");
    }

    
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
            <button className="login-button" type="submit">
              LOG IN
            </button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      //{error && <p style={{ color: "red" }}>{error}</p>} si error true muestra <p style={{ color: "red" }}>{error}</p>
  );
}