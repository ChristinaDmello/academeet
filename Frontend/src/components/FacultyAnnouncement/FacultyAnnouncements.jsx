import React, { useState } from "react";
import "./FacultyAnnouncements.css";

const FacultyAnnouncements = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Mid-Term Exam Schedule",
      description: "Mid-term exams will begin from 15th March.",
      category: "Exam",
      date: "2026-02-20",
      pinned: true,
      image: null,
    },
    {
      id: 2,
      title: "Workshop on AI",
      description: "AI workshop will be conducted in Seminar Hall.",
      category: "Event",
      date: "2026-02-25",
      pinned: false,
      image: null,
    },
  ]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    pinned: false,
    image: null,
  });

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔹 Handle image upload
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  // 🔹 Submit form (add/edit)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingItem) {
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        date: new Date().toISOString().split("T")[0],
      };
      setAnnouncements([newItem, ...announcements]);
    }

    setShowForm(false);
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      category: "General",
      pinned: false,
      image: null,
    });
  };

  // 🔹 Delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // 🔹 Edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  // 🔹 Pin toggle
  const togglePin = (id) => {
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      )
    );
  };

  // 🔹 Filtering + sorting
  const filtered = announcements
    .filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) &&
        (categoryFilter === "All" || a.category === categoryFilter)
    )
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      return new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="fa-container">
      <h2>Faculty Announcements</h2>

      {/* Upload Button */}
      <button
        className="upload-btn"
        onClick={() => {
          setShowForm(true);
          setEditingItem(null);
        }}
      >
        + Upload Announcement
      </button>

      {/* Search + Filter */}
      <div className="fa-controls">
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option>All</option>
          <option>Exam</option>
          <option>Event</option>
          <option>General</option>
        </select>
      </div>

      {/* List */}
      <div className="fa-list">
        {filtered.map((item) => (
          <div key={item.id} className="fa-card">
            <div className="fa-card-header">
              <h3>{item.title}</h3>
              {item.pinned && <span className="pin">📌</span>}
            </div>

            <p className="fa-date">{item.date}</p>

            <div className="fa-actions">
              <button onClick={() => setViewItem(item)}>View</button>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
              <button onClick={() => togglePin(item.id)}>
                {item.pinned ? "Unpin" : "Pin"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fa-modal">
          <div className="fa-modal-content">
            <h3>{viewItem.title}</h3>
            <p><b>Category:</b> {viewItem.category}</p>
            <p>{viewItem.description}</p>
            {viewItem.image && (
              <img src={viewItem.image} alt="announcement" />
            )}
            <button onClick={() => setViewItem(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fa-modal">
          <div className="fa-modal-content">
            <h3>{editingItem ? "Edit" : "Upload"} Announcement</h3>

            <form onSubmit={handleSubmit} className="fa-form">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option>General</option>
                <option>Exam</option>
                <option>Event</option>
              </select>

              <label className="pin-check">
                <input
                  type="checkbox"
                  name="pinned"
                  checked={formData.pinned}
                  onChange={handleChange}
                />
                Pin this announcement
              </label>

              <input type="file" accept="image/*" onChange={handleImage} />

              <div className="fa-form-buttons">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Back Button at Bottom */}
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
    </div>
  );
};

export default FacultyAnnouncements;