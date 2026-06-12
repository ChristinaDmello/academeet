import { useState } from 'react';
import './StudentNotes.css';

const DEPARTMENTS = ['Computer', 'IT', 'Mechanical', 'Civil', 'Electronics'];
const YEARS       = ['1', '2', '3', '4'];
const SUBJECTS    = ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks'];

// Prefix all fileUrl values with this so the browser reaches the backend server
// Without it, /uploads/abc.pdf tries to open on localhost:5173 and causes a page refresh
const SERVER = 'http://localhost:5000';

function StudentNotes({ onBack }) {
  // Filter selections
  const [department, setDepartment]       = useState('');
  const [year, setYear]                   = useState('');
  const [subject, setSubject]             = useState('');
  const [customSubject, setCustomSubject] = useState(''); // used when subject === 'Other'

  // Notes fetched from backend
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [searched, setSearched] = useState(false); // true after first search

  const handleViewNotes = async () => {
    // If subject is "Other", use the typed custom value instead
    const finalSubject = subject === 'Other' ? customSubject.trim() : subject;

    if (!department || !year || !finalSubject) {
      setError('Please select all fields before viewing notes.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Build the URL with query params so backend filters correctly
      const url = `http://localhost:5000/api/notes?department=${department}&year=${year}&subject=${encodeURIComponent(finalSubject)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch notes.');
        return;
      }

      setNotes(data.notes);
      setSearched(true);
    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-notes-page">
      <div className="student-notes-card">
        <h1 className="notes-heading">Student Notes</h1>

        {/* Department */}
        <div className="notes-field">
          <label>Department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="" disabled>Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="notes-field">
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="" disabled>Select Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Subject — includes "Other" option */}
        <div className="notes-field">
          <label>Subject</label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setCustomSubject(''); // clear custom when switching
            }}
          >
            <option value="" disabled>Select Subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Custom subject input — only visible when "Other" is selected */}
        {subject === 'Other' && (
          <div className="notes-field">
            <label>Enter Subject Name</label>
            <input
              type="text"
              className="notes-text-input"
              placeholder="Type your subject name"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>
        )}

        {/* Error message */}
        {error && <p className="notes-error">{error}</p>}

        <button
          className="view-notes-btn"
          onClick={handleViewNotes}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View Notes'}
        </button>

        {/* Notes list — shown after "View Notes" is clicked */}
        {searched && (
          <div className="notes-results">
            {notes.length === 0 ? (
              <p className="empty-text">No notes found for the selected filters.</p>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="note-result-item">
                  <div className="note-info">
                    <p className="note-title">{note.title}</p>
                    <p className="note-meta">
                      {note.subject} &bull; Year {note.year} &bull; {note.department}
                    </p>
                  </div>
                  {/* Full absolute URL — prevents page-refresh bug */}
                  <a
                    href={`${SERVER}${note.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="download-link"
                  >
                    Download
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {onBack && (
          <button className="back-btn" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}

export default StudentNotes;
