import { useState, useEffect } from "react";
import "./FacultyEvents.css";
import techtalkImg    from "../../assets/techtalk.png";
import culturalfestImg from "../../assets/culturalfest.webp";
import hackathonImg   from "../../assets/hackathon.jpg";

const SERVER = 'http://localhost:5000';

const DEFAULT_EVENTS = [
  {
    _id:         'default-techtalk',
    title:       'Tech Talk',
    description: 'A session on latest technologies',
    date:        '2026-05-10',
    time:        '10:00',
    venue:       'Seminar Hall',
    image:       techtalkImg,
    attendees:   [],
    isDefault:   true,
  },
  {
    _id:         'default-culturalfest',
    title:       'Cultural Fest',
    description: 'Annual cultural celebration',
    date:        '2026-06-05',
    time:        '14:00',
    venue:       'College Ground',
    image:       culturalfestImg,
    attendees:   [],
    isDefault:   true,
  },
  {
    _id:         'default-hackathon',
    title:       'Hackathon',
    description: '24-hour coding competition',
    date:        '2026-05-25',
    time:        '09:00',
    venue:       'Computer Lab',
    image:       hackathonImg,
    attendees:   [],
    isDefault:   true,
  },
];

function getImageSrc(event) {
  if (event.imageUrl) return `${SERVER}${event.imageUrl}`;
  if (event.image)    return event.image;
  return null;
}

function formatTime(time) {
  if (!time) return '';
  if (time.includes('AM') || time.includes('PM')) return time;
  const [hour, minute] = time.split(':');
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minute} ${ampm}`;
}

function toDateInput(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

function FacultyEvents({ onBack }) {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [viewEvent, setViewEvent]         = useState(null);
  const [viewAttendees, setViewAttendees] = useState([]);
  const [viewLoading, setViewLoading]     = useState(false);

  const [showForm, setShowForm]   = useState(false);
  const [isEdit, setIsEdit]       = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const [formTitle, setFormTitle]             = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate]               = useState('');
  const [formTime, setFormTime]               = useState('');
  const [formVenue, setFormVenue]             = useState('');
  const [formImage, setFormImage]             = useState(null);
  const [formImagePreview, setFormImagePreview] = useState('');
  const [formLoading, setFormLoading]         = useState(false);
  const [formError, setFormError]             = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${SERVER}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      if (res.ok) {
        const backendEvents = data.events || [];
        const backendTitles = new Set(backendEvents.map(e => e.title));
        const extras = DEFAULT_EVENTS.filter(d => !backendTitles.has(d.title));
        setEvents([...backendEvents, ...extras]);
      } else {
        console.error('fetchEvents failed:', res.status, data);
        setFetchError(data.message || `Error ${res.status}: Could not load events.`);
        setEvents(DEFAULT_EVENTS);
      }
    } catch (err) {
      console.error('fetchEvents network error:', err);
      setFetchError('Cannot connect to server. Make sure the backend is running on port 5000.');
      setEvents(DEFAULT_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleView = async (event) => {
    setViewEvent(event);
    setViewAttendees([]);
    setViewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${SERVER}/api/events/${event._id}/attendees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      if (res.ok) setViewAttendees(data.attendees || []);
    } catch (_) {
      setViewAttendees([]);
    } finally {
      setViewLoading(false);
    }
  };

  const openCreate = () => {
    setIsEdit(false);
    setEditEvent(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate('');
    setFormTime('');
    setFormVenue('');
    setFormImage(null);
    setFormImagePreview('');
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (event) => {
    setIsEdit(true);
    setEditEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description || '');
    setFormDate(toDateInput(event.date));
    setFormTime(event.time || '');
    setFormVenue(event.venue || '');
    setFormImage(null);
    setFormImagePreview(getImageSrc(event) || '');
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setEditEvent(null);
    setFormImage(null);
    setFormImagePreview('');
    setFormError('');
  };

  const handleFormSubmit = async () => {
    if (!formTitle || !formDescription || !formDate || !formTime || !formVenue) {
      setFormError('Please fill in all fields.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const formData = new FormData();
    formData.append('title',       formTitle);
    formData.append('description', formDescription);
    formData.append('date',        formDate);
    formData.append('time',        formTime);
    formData.append('venue',       formVenue);
    if (formImage) formData.append('image', formImage);

    try {
      const token = localStorage.getItem('token');

      if (isEdit) {
        const eventId = editEvent._id || editEvent.id;
        await fetch(`${SERVER}/api/events/${eventId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        await fetch(`${SERVER}/api/events`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      await fetchEvents();
    } catch (_) {
      setFormError('Could not connect to server. Please try again.');
      setFormLoading(false);
      return;
    }

    setFormLoading(false);
    closeForm();
  };

  const deleteEvent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${SERVER}/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchEvents();
    } catch (_) {
      // keep list as-is if delete fails
    }
  };

  return (
    <div className="events-page">
      <h2 className="events-title">Manage Events</h2>

      <button className="create-btn" onClick={openCreate}>
        + Create Event
      </button>

      {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Loading events...</p>}

      {fetchError && (
        <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.9rem', margin: '10px 0' }}>
          {fetchError}
        </p>
      )}

      {!loading && !fetchError && events.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', margin: '20px 0' }}>
          No events yet. Click "+ Create Event" to add one.
        </p>
      )}

      {/* Events grid */}
      <div className="events-grid">
        {events.map((event) => (
          <div key={event._id} className="event-card">
            {getImageSrc(event)
              ? <img src={getImageSrc(event)} alt={event.title} className="event-img" />
              : <div className="event-img-placeholder">No Image</div>
            }
            <h4>{event.title}</h4>
            <p className="event-date-text">
              {toDateInput(event.date)} · {formatTime(event.time)}
            </p>

            <div className="faculty-actions">
              {event.isDefault ? (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Default event</span>
              ) : (
                <>
                  <button onClick={() => handleView(event)}>View</button>
                  <button className="edit-action-btn" onClick={() => openEdit(event)}>Edit</button>
                  <button className="delete-action-btn" onClick={() => deleteEvent(event._id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {viewEvent && (
        <div className="event-modal" onClick={() => setViewEvent(null)}>
          <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{viewEvent.title}</h3>
            <h4>Registered Students ({viewAttendees.length})</h4>

            {viewLoading ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading attendees...</p>
            ) : viewAttendees.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No students registered yet.</p>
            ) : (
              <div className="student-list">
                {viewAttendees.map((s, i) => (
                  <div key={i} className="student-card">
                    <b>{s.name}</b>
                    <p>{s.department}</p>
                    <p>{s.email}</p>
                  </div>
                ))}
              </div>
            )}

            <button className="close-btn" onClick={() => setViewEvent(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="event-modal" onClick={closeForm}>
          <div className="event-modal-content form-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="form-modal-title">
              {isEdit ? 'Edit Event' : 'Create New Event'}
            </h3>

            <div className="form-field">
              <label>Title</label>
              <input type="text" placeholder="Event title" value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea placeholder="Short description" value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)} rows={3} />
            </div>

            <div className="form-field">
              <label>Date</label>
              <input type="date" value={formDate}
                onChange={(e) => setFormDate(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Time</label>
              <input type="time" value={formTime}
                onChange={(e) => setFormTime(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Venue</label>
              <input type="text" placeholder="e.g. Seminar Hall A" value={formVenue}
                onChange={(e) => setFormVenue(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Event Image <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
              <input type="file" accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setFormImage(file);
                  setFormImagePreview(URL.createObjectURL(file));
                }}
              />
            </div>

            {formImagePreview && (
              <img src={formImagePreview} alt="Preview" className="form-image-preview" />
            )}

            {formError && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '4px 0 0' }}>
                {formError}
              </p>
            )}

            <div className="form-actions">
              <button className="cancel-form-btn" onClick={closeForm}>Cancel</button>
              <button className="submit-form-btn" onClick={handleFormSubmit} disabled={formLoading}>
                {formLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="back-wrap">
        <button className="back-btn" onClick={onBack}>← Back to Home</button>
      </div>
    </div>
  );
}

export default FacultyEvents;
