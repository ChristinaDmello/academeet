
// import { useState } from 'react';
// import './HomePage.css';
// import logo from "../assets/logo-img.png";
// import events from "../assets/events_icon.jpg";
// import doubts from "../assets/doubts.jpg";
// import lost from "../assets/lost-found-icon.webp";
// import announcement from "../assets/annoucement_icon.webp"
// import notes from "../assets/notes_icon.webp";


// function HomePage({ onNavigate, userType }) {
//   const [showProfileDropdown, setShowProfileDropdown] = useState(false);

//   const dashboardCards  = [
//   { id: 'notes', title: 'Notes', subtitle: 'View and download study material', icon: notes },
//   { id: 'announcements', title: 'Announcements', subtitle: 'Stay updated with college news', icon: announcement },
//   { id: 'events', title: 'Events', subtitle: 'Discover upcoming college events', icon: events },
//   { id: 'lost-found', title: 'Lost & Found', subtitle: 'Report or find lost items', icon: lost },
//   { id: 'doubts', title: 'Doubts', subtitle: 'Ask questions and get answers', icon: doubts },
// ];

  
//   const handleCardClick = (cardId) => {
//   if (cardId === 'notes') {
//     onNavigate && onNavigate(
//       userType === 'faculty' ? 'faculty-notes' : 'notes'
//     );
//   } else {
//     onNavigate && onNavigate(cardId);
//   }
// };

  
//   const handleProfileClick = () => {
//     setShowProfileDropdown(prev => !prev);
//   };

//   const handleLogout = () => {
//     setShowProfileDropdown(false);
//     onNavigate && onNavigate('logout');
//   };

//   return (
//     <div className="homepage">
//       <nav className="homepage-nav">
//         <div className="nav-left">
//           <div className="logo-placeholder">
//             <img src={logo} alt="Academeet logo" />
//           </div>
//           <h1 className="app-title">Academeet</h1>
//         </div>

//         <div className="nav-right">
//           <div className="profile-container">
//             <button className="profile-icon" onClick={handleProfileClick}>
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//                 <circle cx="12" cy="8" r="3" fill="currentColor"/>
//                 <path d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21"
//                   stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//               </svg>
//             </button>

//             {showProfileDropdown && (
//               <div className="profile-dropdown">
//                 <button className="dropdown-item">View Profile</button>
//                 <button className="dropdown-item" onClick={handleLogout}>
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </nav>

//       <main className="homepage-main">
//         <div className="dashboard-grid">
//           {dashboardCards.map(card => (
//             <div
//               key={card.id}
//               className="dashboard-card"
//               onClick={() => handleCardClick(card.id)}
//             >
//               <img src={card.icon} alt={card.title} className="card-icon" />
//               <h3>{card.title}</h3>
//               <p>{card.subtitle}</p>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default HomePage;
import { useState } from 'react';
import './HomePage.css';
import logo from "../../assets/logo-img.png";
import events from "../../assets/events_icon.jpg";
import doubts from "../../assets/doubts.jpg";
import lost from "../../assets/lost-found-icon.webp";
import announcement from "../../assets/annoucement_icon.webp";
import notes from "../../assets/notes_icon.webp";

function HomePage({ onNavigate, userType }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const dashboardCards = [
    { id: 'notes', title: 'Notes', subtitle: 'View and download study material', icon: notes },
    { id: 'announcements', title: 'Announcements', subtitle: 'Stay updated with college news', icon: announcement },
    { id: 'events', title: 'Events', subtitle: 'Discover upcoming college events', icon: events },
    { id: 'lost-found', title: 'Lost & Found', subtitle: 'Report or find lost items', icon: lost },
    { id: 'doubts', title: 'Doubts', subtitle: 'Ask questions and get answers', icon: doubts },
  ];

  const handleCardClick = (cardId) => {
  if (!onNavigate) return;
  if (cardId === 'notes') {
    onNavigate(userType === 'faculty' ? 'faculty-notes' : 'notes');
  } 
  else if (cardId === 'lost-found') {
    onNavigate('lost-found');
  } 
  else if (cardId === 'doubts') {
    onNavigate(userType === 'faculty' ? 'faculty-doubts' : 'student-doubts');
  }
  else if (cardId === 'announcements') {
    onNavigate(userType === 'faculty' ? 'faculty-announcements' : 'student-announcements');
  }
  else if (cardId === 'events') {
    onNavigate(userType === 'faculty' ? 'faculty-events' : 'student-events');
  }
  else {
    onNavigate(cardId);
  }
};

  const handleProfileClick = () => {
    setShowProfileDropdown(prev => !prev);
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    onNavigate && onNavigate('logout');
  };

  return (
    <div className="homepage">
      <nav className="homepage-nav">
        <div className="nav-left">
          <div className="logo-placeholder">
            <img src={logo} alt="Academeet logo" />
          </div>
          <h1 className="app-title">Academeet</h1>
        </div>

        <div className="nav-right">
          <div className="profile-container">
            <button className="profile-icon" onClick={handleProfileClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3" fill="currentColor" />
                <path
                  d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <button className="dropdown-item">View Profile</button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="homepage-main">
        <div className="dashboard-grid">
          {dashboardCards.map(card => (
            <div
              key={card.id}
              className="dashboard-card"
              onClick={() => handleCardClick(card.id)}
            >
              <img src={card.icon} alt={card.title} className="card-icon" />
              <h3>{card.title}</h3>
              <p>{card.subtitle}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default HomePage;