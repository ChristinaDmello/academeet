import { useState, useMemo } from "react";
import "./StudentAnnouncements.css";

function StudentAnnouncements({ onBack }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [pinnedIds, setPinnedIds] = useState([1, 3]);
  const [expandedId, setExpandedId] = useState(null);

  
  const announcements = [
    {
      id: 1,
      title: "Mid-Sem Exam Schedule Released",
      description:
        "The mid-sem examination schedule has been released. Students are requested to check the timetable carefully.",
      category: "Exam",
      date: "2026-02-20",
    },
    {
      id: 2,
      title: "Tech Fest 2026 Registration Open",
      description:
        "Registration for Tech Fest 2026 is now open. Participate and showcase your skills.",
      category: "Event",
      date: "2026-02-25",
    },
    {
      id: 3,
      title: "College Closed on Friday",
      description:
        "The college will remain closed this Friday due to a public holiday.",
      category: "Holiday",
      date: "2026-02-18",
    },
    {
      id: 4,
      title: "Placement Drive Next Week",
      description:
        "A placement drive by top companies will be conducted next week.",
      category: "General",
      date: "2026-02-26",
    },
  ];

  // 🔹 Toggle pin
  const togglePin = (id) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // 🔹 Filter + search + sort
  const filteredAnnouncements = useMemo(() => {
    let data = [...announcements];

    // search
    if (search.trim()) {
      data = data.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // category filter
    if (category !== "All") {
      data = data.filter((a) => a.category === category);
    }

    // sort latest first
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    return data;
  }, [search, category]);

  const pinned = filteredAnnouncements.filter((a) =>
    pinnedIds.includes(a.id)
  );
  const others = filteredAnnouncements.filter(
    (a) => !pinnedIds.includes(a.id)
  );

  return (
    <div className="student-ann-page">
      <h1 className="ann-title">Announcements</h1>

      {/* 🔍 Search + Filter */}
      <div className="ann-controls">
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All</option>
          <option>Exam</option>
          <option>Event</option>
          <option>Holiday</option>
          <option>General</option>
        </select>
      </div>

      {/* 📌 Pinned Section */}
      {pinned.length > 0 && (
        <>
          <h2 className="section-heading">📌 Pinned</h2>
          <div className="ann-grid">
            {pinned.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                ann={ann}
                pinned
                togglePin={togglePin}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            ))}
          </div>
        </>
      )}

      {/* 📋 All Announcements */}
      <h2 className="section-heading">All Announcements</h2>
      <div className="ann-grid">
        {others.map((ann) => (
          <AnnouncementCard
            key={ann.id}
            ann={ann}
            pinned={false}
            togglePin={togglePin}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        ))}
      </div>

      {/* 🔙 Back Button at bottom */}
      <div className="ann-back-wrap">
        <button className="ann-back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}

function AnnouncementCard({
  ann,
  pinned,
  togglePin,
  expandedId,
  setExpandedId,
}) {
  const isOpen = expandedId === ann.id;

  return (
    <div className="ann-card">
      <div className="ann-card-top">
        <h3>{ann.title}</h3>

        <button
          className={`pin-btn ${pinned ? "active" : ""}`}
          onClick={() => togglePin(ann.id)}
        >
          📌
        </button>
      </div>

      <div className="ann-meta">
        <span className="badge">{ann.category}</span>
        <span className="date">{ann.date}</span>
      </div>

      <button
        className="view-btn"
        onClick={() => setExpandedId(isOpen ? null : ann.id)}
      >
        {isOpen ? "Hide Details" : "View Details"}
      </button>

      {isOpen && (
        <p className="ann-desc">{ann.description}</p>
      )}
    </div>
  );
}

export default StudentAnnouncements;