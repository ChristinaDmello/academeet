import { useState, useEffect } from "react";
import "./StudentEvents.css";
import techtalkImg    from "../../assets/techtalk.png";
import culturalfestImg from "../../assets/culturalfest.webp";
import hackathonImg   from "../../assets/hackathon.jpg";

const SERVER = 'http://localhost:5000';

// These 3 events always appear on the page.
// If the backend already has an event with the same title, the DB version is used
// so there are no duplicates and the DB version can be registered for.
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

function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
}

function StudentEvents({ onBack }) {
  const [events, setEvents]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [fetchError, setFetchError]       = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const userId = getUserIdFromToken();

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
        // Only include a default if the DB doesn't already have that title
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

  const isRegistered = (event) =>
    event.attendees?.some((id) => id.toString() === userId);

  const handleRegister = async (event) => {
    setRegisterLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${SERVER}/api/events/${event._id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchEvents();
    } catch (_) {
      // ignore network errors
    } finally {
      setRegisterLoading(false);
      setSelectedEvent(null);
    }
  };

  const registeredEvents = events.filter((e) => isRegistered(e));

  return (
    <div className="events-page">
      <h2 className="events-title">Events</h2>

      {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Loading events...</p>}

      {fetchError && (
        <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.9rem', margin: '10px 0' }}>
          {fetchError}
        </p>
      )}

      {/* All Events */}
      <h3 className="section-heading">All Events</h3>
      <div className="events-grid">
        {events.map((event) => (
          <div key={event._id} className="event-card">
            {getImageSrc(event)
              ? <img src={getImageSrc(event)} alt={event.title} className="event-img" />
              : <div className="event-img-placeholder">No Image</div>
            }
            <h4>{event.title}</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 8px' }}>
              {toDateInput(event.date)} · {formatTime(event.time)}
            </p>
            <button className="view-btn" onClick={() => setSelectedEvent(event)}>
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Registered Events */}
      <h3 className="section-heading">Registered Events</h3>
      <div className="events-grid">
        {registeredEvents.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No registered events yet.</p>
        ) : (
          registeredEvents.map((event) => (
            <div key={event._id} className="event-card registered">
              {getImageSrc(event)
                ? <img src={getImageSrc(event)} alt={event.title} className="event-img" />
                : <div className="event-img-placeholder">No Image</div>
              }
              <h4>{event.title}</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 6px' }}>
                {toDateInput(event.date)} · {formatTime(event.time)}
              </p>
              <p className="registered-tag">✅ Registered</p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div className="event-modal" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
            {getImageSrc(selectedEvent) && (
              <img
                src={getImageSrc(selectedEvent)}
                alt={selectedEvent.title}
                style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }}
              />
            )}
            <h3>{selectedEvent.title}</h3>
            <p>{selectedEvent.description}</p>
            <p><b>Date:</b> {toDateInput(selectedEvent.date)}</p>
            <p><b>Time:</b> {formatTime(selectedEvent.time)}</p>
            {selectedEvent.venue && <p><b>Venue:</b> {selectedEvent.venue}</p>}

            {!selectedEvent.isDefault && !isRegistered(selectedEvent) && (
              <button
                className="register-btn"
                disabled={registerLoading}
                onClick={() => handleRegister(selectedEvent)}
              >
                {registerLoading ? 'Registering...' : 'RSVP / Register'}
              </button>
            )}

            {!selectedEvent.isDefault && isRegistered(selectedEvent) && (
              <p className="registered-tag" style={{ textAlign: 'center', marginTop: '8px' }}>
                ✅ You are registered
              </p>
            )}

            <button className="close-btn" onClick={() => setSelectedEvent(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="back-wrap">
        <button className="back-btn" onClick={onBack}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default StudentEvents;
