import { useState } from "react";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/sessionContext";
import logo from '../assets/logo.svg';
import Icon_OctagonX from '../assets/octagon-x.svg?react';
import Icon_github from '../assets/github.svg?react';
import Icon_linkedin from '../assets/linkedin.svg?react';


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
      setError("There has been a server error");
    }
  }

  function handleGuest() {
    setSession({
      type: "guest",
      userData: null,
    });
    navigate("/timeline");
  }

  return (
    <div className="login-container">

      <div className="login-box">
        <div className="login-left">

          <img className="login_logo" src={logo} alt="lime-line logo"/>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              className="login-input"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label>Password</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error ? (
              <div className="error-message">
                <Icon_OctagonX className="error-icon" />
                <p className="error-text">{error}</p>
              </div>
            ) : (
              <div className="login-buttons-row">
                <button className="login-btn primary" type="submit">
                  Log in
                </button>
                <button
                  type="button"
                  className="login-btn secondary"
                  onClick={() => navigate("/register")}
                >
                  Create account
                </button>
              </div>
            )}

            <div className="guest-row">
              or <span className="guest-link" onClick={handleGuest}>Continue as guest</span>
            </div>

            
          </form>
        </div>

        <div className="login-right">
          <div className="quotes"></div>
          <div className="social_icons">
            <Icon_github className="social_icon" onClick={() => window.open("https://github.com/Samugcor/TFC_DAM_Samuel_Iglesias", "_blank")} />
            <Icon_linkedin className="social_icon" onClick={() => window.open("https://www.linkedin.com/in/samuel-i-b0372a23a/", "_blank")} />
          </div>
          
        </div>

      </div>
    </div>
  );
}
