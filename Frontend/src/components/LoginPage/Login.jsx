import { useState } from 'react';
import './Login.css';

function Login({ onBack, onLogin, userType }) {
  // State to track what the user types in the form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for showing errors and loading status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();   // stop the page from refreshing
    setError('');         // clear any previous error

    // Basic check — don't call API if fields are empty
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);  // show loading state on button

    try {
      // Call the backend login API
      // We also send 'role' (the portal the user selected) so the backend
      // can reject a student trying to log in through the faculty portal, and vice versa
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: userType }),
      });

      // Parse the JSON response from the server
      const data = await response.json();

      if (!response.ok) {
        // Server returned an error (e.g. wrong password, user not found)
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      // ── Success ──
      // Save the JWT token so future API calls can use it
      localStorage.setItem('token', data.token);

      // Save the role so the app knows if this is a student or faculty
      localStorage.setItem('userRole', data.user.role);

      // Tell App.jsx to set userType and navigate to home
      // We pass the role so App.jsx can update its userType state
      onLogin(data.user.role);

    } catch (err) {
      // This runs if the server is down or there's a network issue
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);  // always turn off loading at the end
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your account</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="collegeEmail">College Email</label>
            <input
              id="collegeEmail"
              name="collegeEmail"
              type="email"
              autoComplete="email"
              placeholder="name@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}  // update state on every keystroke
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Show error message if something went wrong */}
          {error && <p style={{ color: 'red', fontSize: '0.875rem', margin: '0' }}>{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {onBack && (
            <button
              type="button"
              className="login-button login-button-back"
              onClick={onBack}
            >
              Back
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
