import { useState } from "react";
import "./FacultyDoubts.css";

function FacultyDoubts({ onBack }) {
  const [doubts, setDoubts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [answerImage, setAnswerImage] = useState(null);

  const toggleDetails = (id) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const handleAddAnswer = (id) => {
    if (!answerText) return;

    setDoubts(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              answers: [
                ...d.answers,
                {
                  text: answerText,
                  image: answerImage
                    ? URL.createObjectURL(answerImage)
                    : null,
                },
              ],
            }
          : d
      )
    );

    setAnswerText("");
    setAnswerImage(null);
  };

  return (
    <div className="doubts-page">
      <div className="doubts-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Doubts</h2>
      </div>

      <div className="doubts-grid">
        {doubts.map(doubt => (
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

            {activeId === doubt.id && (
              <div className="details">
                <p>{doubt.description}</p>

                {/* ✅ Faculty Answer Box */}
                <textarea
                  placeholder="Write answer..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />

                <input
                  type="file"
                  onChange={(e) => setAnswerImage(e.target.files[0])}
                />

                <button
                  className="submit-btn"
                  onClick={() => handleAddAnswer(doubt.id)}
                >
                  Add Answer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FacultyDoubts;