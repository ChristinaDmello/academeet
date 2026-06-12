import { useState } from "react";
import "./LostFound.css";

function LostFound({ onBack }) {
  const [activeTab, setActiveTab] = useState("lost");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [type, setType] = useState("lost");

  // dummy data
  const [items, setItems] = useState([]);

  const handlePost = () => {
    if (!title || !description || !location || !image) {
      alert("Please fill all fields");
      return;
    }

    const newItem = {
      id: Date.now(),
      title,
      description,
      location,
      type,
      imageUrl: URL.createObjectURL(image),
    };

    setItems(prev => [newItem, ...prev]);

    // reset
    setTitle("");
    setDescription("");
    setLocation("");
    setImage(null);
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  return (
    <div className="lostfound-page">
      <div className="lostfound-header">
        <h2>Lost & Found</h2>
      </div>

      
      <div className="post-card">
        <h3>Post Lost / Found Item</h3>

        <div className="post-grid">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="lost">Lost Item</option>
            <option value="found">Found Item</option>
          </select>

          <input
            type="text"
            placeholder="Item name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button className="post-btn" onClick={handlePost}>
          Post Item
        </button>
      </div>

      
      <div className="tabs">
        <button
          className={activeTab === "lost" ? "tab active" : "tab"}
          onClick={() => setActiveTab("lost")}
        >
          Lost Items
        </button>

        <button
          className={activeTab === "found" ? "tab active" : "tab"}
          onClick={() => setActiveTab("found")}
        >
          Found Items
        </button>
      </div>

      
      <div className="items-grid">
        {filteredItems.length === 0 ? (
          <p className="empty-text">No items yet</p>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="item-card">
              <img src={item.imageUrl} alt={item.title} />

              <div className="item-body">
                <h4>{item.title}</h4>
                <p className="desc">{item.description}</p>
                <p className="location">📍 {item.location}</p>
              </div>
            </div>
          ))
        )}
      </div>

      
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      )}
    </div>
  );
}

export default LostFound;