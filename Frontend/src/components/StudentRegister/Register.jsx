import { useState } from 'react';
import './Register.css';

function Register({ onBack, onRegister }) {
  // One state variable for each form field
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check all fields are filled
    if (!fullName || !email || !password || !confirmPassword || !department || !year) {
      setError('Please fill in all fields.');
      return;
    }

    // Check passwords match before calling the API
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Call the backend register API
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: 'student',        // always "student" for this form
          department,
          year: Number(year),     // convert "2" (string) to 2 (number)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      // ── Success ──
      // Save the JWT token so future API calls can use it
      localStorage.setItem('token', data.token || '');

      // Save the role
      localStorage.setItem('userRole', 'student');

      // Tell App.jsx to set userType to 'student' and navigate to home
      onRegister('student');

    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Create your account</h1>
        <p className="register-subtitle">Use your college email to sign up.</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="register-field">
            <label htmlFor="collegeEmail">College Email</label>
            <input
              id="collegeEmail"
              name="collegeEmail"
              type="email"
              autoComplete="email"
              placeholder="name@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="register-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="register-field">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="" disabled>Select your department</option>
              <option value="cse">Computer Science</option>
              <option value="ece">Electronics & Communication</option>
              <option value="eee">Electrical</option>
              <option value="it">Information Technology</option>
              <option value="mech">Mechanical</option>
              <option value="civil">Civil</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="register-field">
            <label htmlFor="year">Current Year of Study</label>
            <select
              id="year"
              name="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="" disabled>Select your year</option>
              <option value="1">1st</option>
              <option value="2">2nd</option>
              <option value="3">3rd</option>
              <option value="4">4th</option>
            </select>
          </div>

          {/* Show error message if something went wrong */}
          {error && <p style={{ color: 'red', fontSize: '0.875rem', margin: '0' }}>{error}</p>}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          {onBack && (
            <button
              type="button"
              className="register-button"
              style={{
                background: 'transparent',
                color: '#1e90ff',
                border: '1px solid rgba(30, 144, 255, 0.45)',
              }}
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

export default Register;
