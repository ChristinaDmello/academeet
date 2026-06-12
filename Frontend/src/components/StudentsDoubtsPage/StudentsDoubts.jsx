import { useState } from "react";
import "./StudentDoubts.css";

function StudentDoubts({ onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [doubts, setDoubts] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handlePost = () => {
    if (!title || !description) {
      alert("Fill all fields");
      return;
    }

    const newDoubt = {
      id: Date.now(),
      title,
      description,
      image: image ? URL.createObjectURL(image) : null,
      postedBy: "Student",
      date: new Date().toLocaleDateString(),
      answers: [],
      expanded: false,
    };

    setDoubts(prev => [newDoubt, ...prev]);

    setTitle("");
    setDescription("");
    setImage(null);
    setShowForm(false);
  };

  const toggleDetails = (id) => {
    setDoubts(prev =>
      prev.map(d =>
        d.id === id ? { ...d, expanded: !d.expanded } : d
      )
    );
  };

  return (
    <div className="doubts-page">
      <div className="doubts-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Doubts</h2>
        <button
          className="post-btn"
          onClick={() => setShowForm(prev => !prev)}
        >
          + Post Doubt
        </button>
      </div>

      {showForm && (
        <div className="post-card">
          <input
            type="text"
            placeholder="Doubt title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Describe your doubt..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input type="file" onChange={(e) => setImage(e.target.files[0])} />

          <button className="submit-btn" onClick={handlePost}>
            Submit Doubt
          </button>
        </div>
      )}

      <div className="doubts-grid">
        {doubts.length === 0 ? (
          <p className="empty-text">No doubts posted yet</p>
        ) : (
          doubts.map(doubt => (
            <div key={doubt.id} className="doubt-card">
              {doubt.image && (
                <img src={doubt.image} alt="" className="doubt-img" />
              )}

              <h3>{doubt.title}</h3>

              <button
                className="view-btn"
                onClick={() => toggleDetails(doubt.id)}
              >
                View Details
              </button>

              {doubt.expanded && (
                <div className="details">
                  <p>{doubt.description}</p>
                  <small>
                    Posted by {doubt.postedBy} • {doubt.date}
                  </small>

                  {doubt.answers.length > 0 && (
                    <div className="answers">
                      {doubt.answers.map((ans, i) => (
                        <div key={i} className="answer-item">
                          <p>{ans.text}</p>
                          {ans.image && (
                            <img src={ans.image} alt="" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentDoubts;