import "./Login.css";

export default function LogIn() {

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

            <form className="login-form">
              <input type="email" placeholder="Email" className="login-input" />
              <input type="password" placeholder="Password" className="login-input" />
              <button type="submit" className="login-button">
                LOG IN
              </button>
            </form>
        </div>
    );
}