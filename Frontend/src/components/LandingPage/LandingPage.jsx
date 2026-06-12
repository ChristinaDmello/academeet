import './LandingPage.css';
import logo from "../../assets/logo-img.png";

function LandingPage({ onStudent, onFaculty }) {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo-placeholder"><img src={logo} alt="Academeet logo" /></div>
        <h1 className="app-title">Academeet</h1>
      </header>

      <div className="landing-content">
        <h2 className="landing-heading">Who are you?</h2>
        
        <div className="landing-cards">
          <button className="landing-card" onClick={onStudent}>
            <div className="card-icon">🧑‍🎓</div>
            <h3 className="card-title">Student</h3>
          </button>

          <button className="landing-card" onClick={onFaculty}>
            <div className="card-icon">👨‍🏫</div>
            <h3 className="card-title">Faculty / Admin</h3>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
