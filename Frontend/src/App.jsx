import './App.css';
import { useState } from 'react';

import LandingPage from "./components/LandingPage/LandingPage";
import AuthPage from "./components/AuthPage/AuthPage";
import Register from "./components/StudentRegister/Register";
import RegisterFaculty from "./components/FacultyRegister/RegisterFaculty";
import Login from "./components/LoginPage/Login";
import HomePage from "./components/HomePage/HomePage";
import StudentNotes from "./components/StudentNotes/StudentNotes";
import FacultyNotes from "./components/FacultyNotes/FacultyNotes";
import LostFound from "./components/LostFound/LostFound";
import StudentDoubts from "./components/StudentsDoubtsPage/StudentsDoubts";
import FacultyDoubts from './components/FacultyDoubtsPage/FacultyDoubts';
import StudentAnnouncements from './components/StudentAnnoucement/StudentAnnouncements';
import FacultyAnnouncements from './components/FacultyAnnouncement/FacultyAnnouncements';
import StudentEvents from './components/StudentEvents/StudentEvents';
import FacultyEvents from './components/FacultyEvents/FacultyEvents';

function App() {
  const [page, setPage] = useState('landing');
  const [userType, setUserType] = useState(null);

  return (
    <>
      {page === 'landing' && (
        <LandingPage
          onStudent={() => {
            setUserType('student');
            setPage('auth');
          }}
          onFaculty={() => {
            setUserType('faculty');
            setPage('auth');
          }}
        />
      )}

      {page === 'auth' && (
        <AuthPage
          userType={userType}
          onLogin={() => setPage('login')}
          onRegister={() => {
            if (userType === 'student') {
              setPage('register-student');
            } else {
              setPage('register-faculty');
            }
          }}
          onBack={() => setPage('landing')}
        />
      )}

      {page === 'login' && (
        <Login
          userType={userType}        // tells Login which portal this is (student or faculty)
          onBack={() => setPage('auth')}
          onLogin={(role) => {
            setUserType(role);
            setPage('home');
          }}
        />
      )}

      {page === 'register-student' && (
        <Register
          onBack={() => setPage('auth')}
          onRegister={(role) => {
            setUserType(role);   // set 'student' from API response
            setPage('home');
          }}
        />
      )}

      {page === 'register-faculty' && (
        <RegisterFaculty
          onBack={() => setPage('auth')}
          onRegister={(role) => {
            setUserType(role);   // set 'faculty' from API response
            setPage('home');
          }}
        />
      )}
     
{page === 'home' && (
  <HomePage
    userType={userType}
    onNavigate={(action) => {
      if (action === 'logout') {
        setUserType(null);
        setPage('landing');
      } else {
        setPage(action); 
      }
    }}
  />
)}

{page === 'notes' && (
  <StudentNotes onBack={() => setPage('home')} />
)}

{page === 'faculty-notes' && (
  <FacultyNotes onBack={() => setPage('home')} />
)}

{page === 'lost-found' && (
  <LostFound onBack={() => setPage('home')} />
)}
{page === 'faculty-doubts' && (
  <FacultyDoubts onBack={() => setPage('home')} />
)}
{page === 'student-doubts' && (
  <StudentDoubts onBack={() => setPage('home')} />
)}
{page === 'faculty-announcements' && (
  <FacultyAnnouncements onBack={() => setPage('home')} />
)}
{page === 'student-announcements' && (
  <StudentAnnouncements onBack={() => setPage('home')} />
)}
{page === 'faculty-events' && (
  <FacultyEvents onBack={() => setPage('home')} />
)}
{page === 'student-events' && (
  <StudentEvents onBack={() => setPage('home')} />
)}
    </>
  );
}

export default App;
