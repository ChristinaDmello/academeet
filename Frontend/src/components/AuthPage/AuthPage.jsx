import './AuthPage.css'
import logo from "../../assets/logo-img.png";

function AuthPage({ onLogin, onRegister, onBack }) {
  return (
    <div className="auth-container">
      <header className="auth-header">
        <div className="logo-placeholder"><img src={logo} alt="" /></div>
        <h1 className="app-title">Academeet</h1>
      </header>
      <div className="auth-buttons">
        <button className="auth-btn login-btn" type="button" onClick={onLogin}>Login</button>
        <button className="auth-btn register-btn" type="button" onClick={onRegister}>Register</button>
        <p className='Tagline'>Connect.Learn.Participate</p>
        {onBack && (
          <button className="auth-btn auth-btn-back" type="button" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}

export default AuthPage
