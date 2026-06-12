import { useState, useEffect } from 'react';
import './FacultyNotes.css';

const DEPARTMENTS = ['Computer', 'IT', 'Mechanical', 'Civil', 'Electronics'];
const YEARS       = ['1', '2', '3', '4'];
const SUBJECTS    = ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks'];

// Backend base URL — all file URLs are relative paths like /uploads/abc.pdf
// Prefixing with this makes them absolute so the browser can actually reach them
const SERVER = 'http://localhost:5000';

function FacultyNotes({ onBack }) {
  // ── Filter / upload state ──
  const [department, setDepartment]       = useState('');
  const [year, setYear]                   = useState('');
  const [subject, setSubject]             = useState('');
  const [customSubject, setCustomSubject] = useState('');

  const [title, setTitle] = useState('');
  const [file, setFile]   = useState(null);

  const [notes, setNotes]         = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // ── Edit modal state ──
  // editNote holds the full note object being edited (null = modal closed)
  const [editNote, setEditNote]               = useState(null);
  const [editTitle, setEditTitle]             = useState('');
  const [editDepartment, setEditDepartment]   = useState('');
  const [editYear, setEditYear]               = useState('');
  const [editSubject, setEditSubject]         = useState('');
  const [editCustomSubject, setEditCustomSubject] = useState('');
  const [editSaving, setEditSaving]           = useState(false);
  const [editError, setEditError]             = useState('');

  const finalSubject = subject === 'Other' ? customSubject.trim() : subject;

  // ── Fetch notes when filters change ──
  useEffect(() => {
    if (!department || !year || !finalSubject) {
      setNotes([]);
      return;
    }
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = `${SERVER}/api/notes?department=${department}&year=${year}&subject=${encodeURIComponent(finalSubject)}`;
        const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setNotes(data.notes);
      } catch (_) {}
    };
    fetchNotes();
  }, [department, year, finalSubject]);

  // ── Upload ──
  const handleUpload = async () => {
    setError('');
    setSuccess('');

    if (!department || !year || !finalSubject || !title || !file) {
      setError('Please fill in all fields and select a file before uploading.');
      return;
    }

    setUploading(true);
    try {
      const token    = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', finalSubject);
      formData.append('department', department);
      formData.append('year', year);
      formData.append('file', file);

      const res  = await fetch(`${SERVER}/api/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Upload failed. Please try again.');
        return;
      }

      setNotes((prev) => [data.note, ...prev]);
      setSuccess('Note uploaded successfully!');
      setTitle('');
      setFile(null);
    } catch (_) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${SERVER}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (_) {
      setError('Could not delete note. Please try again.');
    }
  };

  // ── Open edit modal — pre-fill all fields from the selected note ──
  const handleEditOpen = (note) => {
    setEditNote(note);
    setEditTitle(note.title);
    setEditDepartment(note.department);
    setEditYear(String(note.year));

    // If the note's subject is not in our standard list, put it in "Other"
    if (SUBJECTS.includes(note.subject)) {
      setEditSubject(note.subject);
      setEditCustomSubject('');
    } else {
      setEditSubject('Other');
      setEditCustomSubject(note.subject);
    }

    setEditError('');
  };

  const handleEditClose = () => {
    setEditNote(null);
    setEditError('');
  };

  // ── Save edited note — sends JSON to PUT /api/notes/:id ──
  const handleEditSave = async () => {
    const finalEditSubject = editSubject === 'Other' ? editCustomSubject.trim() : editSubject;

    if (!editTitle || !editDepartment || !editYear || !finalEditSubject) {
      setEditError('Please fill in all fields.');
      return;
    }

    setEditSaving(true);
    setEditError('');

    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${SERVER}/api/notes/${editNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title:      editTitle,
          subject:    finalEditSubject,
          department: editDepartment,
          year:       Number(editYear),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEditError(data.message || 'Update failed. Please try again.');
        return;
      }

      // Replace the old note in the list with the updated one
      setNotes((prev) =>
        prev.map((n) => (n._id === editNote._id ? data.note : n))
      );
      handleEditClose();
    } catch (_) {
      setEditError('Could not connect to the server. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="faculty-notes-page">

      <div className="faculty-notes-header">
        <h2>Upload Notes</h2>
      </div>

      {/* ── Filter row ── */}
      <div className="filters-row">
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="" disabled>Select Department</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="" disabled>Select Year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setCustomSubject(''); }}
        >
          <option value="" disabled>Select Subject</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          <option value="Other">Other</option>
        </select>
      </div>

      {subject === 'Other' && (
        <div style={{ marginBottom: '20px', maxWidth: '520px' }}>
          <input
            type="text"
            className="title-input"
            placeholder="Type your subject name"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
          />
        </div>
      )}

      {/* ── Upload card ── */}
      <div className="upload-card">
        <input
          type="text"
          placeholder="Enter note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        <input
          type="file"
          className="file-input"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {error   && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>}
        {success && <p style={{ color: '#22c55e', fontSize: '0.875rem', margin: 0 }}>{success}</p>}

        <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Notes'}
        </button>
      </div>

      {/* ── Notes list ── */}
      <div className="notes-list">
        <h3>
          {department && year && finalSubject
            ? `Notes — ${subject === 'Other' ? customSubject : subject} · Year ${year} · ${department}`
            : 'Select filters above to see notes'}
        </h3>

        {notes.length === 0 ? (
          <p className="empty-text">No notes found for the selected filters.</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="note-item">
              <span>{note.title}</span>

              <div className="note-actions">
                {/* Download — full absolute URL prevents page-refresh bug */}
                <a
                  href={`${SERVER}${note.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="download-btn"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  Download
                </a>

                <button className="edit-btn" onClick={() => handleEditOpen(note)}>
                  Edit
                </button>

                <button className="delete-btn" onClick={() => handleDelete(note._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {onBack && (
        <button className="back-btn" onClick={onBack} style={{ marginTop: '20px' }}>
          ← Back
        </button>
      )}

      {/* ── Edit Modal — renders on top of everything when editNote is not null ── */}
      {editNote && (
        <div className="modal-overlay" onClick={handleEditClose}>
          {/*
            Stop clicks inside the card from closing the modal.
            Without this, clicking any input would close the modal.
          */}
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Note</h3>

            <div className="modal-field">
              <label>Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>

            <div className="modal-field">
              <label>Department</label>
              <select value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)}>
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="modal-field">
              <label>Year</label>
              <select value={editYear} onChange={(e) => setEditYear(e.target.value)}>
                <option value="" disabled>Select Year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="modal-field">
              <label>Subject</label>
              <select
                value={editSubject}
                onChange={(e) => { setEditSubject(e.target.value); setEditCustomSubject(''); }}
              >
                <option value="" disabled>Select Subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>

            {editSubject === 'Other' && (
              <div className="modal-field">
                <label>Custom Subject</label>
                <input
                  type="text"
                  placeholder="Type subject name"
                  value={editCustomSubject}
                  onChange={(e) => setEditCustomSubject(e.target.value)}
                />
              </div>
            )}

            {/* View existing file in new tab */}
            <a
              href={`${SERVER}${editNote.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="view-file-link"
            >
              View current file ↗
            </a>

            {editError && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{editError}</p>
            )}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleEditClose}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleEditSave} disabled={editSaving}>
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyNotes;
