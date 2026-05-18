import { useState, useEffect, useCallback } from "react";

function Review({ userEmail }) {
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overrideScore, setOverrideScore] = useState("");
  const [overriding, setOverriding] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
    fetchCompleted();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await fetch("http://localhost:8000/review/pending");
      const data = await res.json();
      setPending(data.results);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchCompleted = async () => {
    try {
      const res = await fetch("http://localhost:8000/review/completed");
      const data = await res.json();
      setCompleted(data.results);
    } catch (err) {
      console.log("Could not fetch completed");
    }
  };

  const handleReview = async (action, score) => {
    if (pending.length === 0) return;
    const current = pending[currentIndex];

    try {
      const res = await fetch("http://localhost:8000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result_id: current.id,
          action: action,
          final_score: score,
          reviewed_by: userEmail || "ta"
        })
      });

      if (res.ok) {
        setMessage(action === "approved" ? "✅ Approved!" : "✏️ Overridden!");
        setTimeout(() => setMessage(""), 1500);
        await fetchPending();
        await fetchCompleted();
        setOverrideScore("");
        setOverriding(false);
        if (currentIndex >= pending.length - 1) {
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      setMessage("Error processing review");
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (tab !== "pending" || pending.length === 0) return;
    const current = pending[currentIndex];
    if (e.key === "a" || e.key === "A") {
      handleReview("approved", current.ai_score);
    } else if (e.key === "n" || e.key === "N") {
      if (currentIndex < pending.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } else if (e.key === "o" || e.key === "O") {
      setOverriding(true);
    }
  }, [pending, currentIndex, tab]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const current = pending[currentIndex];

  return (
    <div>
      <h2 style={{ marginBottom: "8px" }}>TA Review Dashboard</h2>
      <p style={{ color: "#888", marginBottom: "16px" }}>
        Review and approve AI-generated grades
      </p>

      {/* Keyboard shortcuts */}
      <div style={{ background: "#1a1a1a", padding: "12px 20px",
        borderRadius: "8px", maxWidth: "700px", marginBottom: "24px",
        border: "1px solid #2a2a2a", display: "flex", gap: "24px" }}>
        <span style={{ color: "#888", fontSize: "13px" }}>
          Keyboard shortcuts:
        </span>
        <span style={{ color: "#4ade80", fontSize: "13px" }}>
          <strong>A</strong> = Approve
        </span>
        <span style={{ color: "#f59e0b", fontSize: "13px" }}>
          <strong>O</strong> = Override
        </span>
        <span style={{ color: "#6c63ff", fontSize: "13px" }}>
          <strong>N</strong> = Next
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px",
        maxWidth: "700px" }}>
        <button onClick={() => setTab("pending")}
          style={{ padding: "8px 20px",
            background: tab === "pending" ? "#6c63ff" : "#1a1a1a",
            color: "white", border: "none", borderRadius: "8px",
            cursor: "pointer" }}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab("completed")}
          style={{ padding: "8px 20px",
            background: tab === "completed" ? "#6c63ff" : "#1a1a1a",
            color: "white", border: "none", borderRadius: "8px",
            cursor: "pointer" }}>
          Completed ({completed.length})
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{ background: "#1a1a1a", padding: "12px 20px",
          borderRadius: "8px", maxWidth: "700px", marginBottom: "16px",
          border: "1px solid #4ade80", color: "#4ade80",
          fontSize: "18px", textAlign: "center" }}>
          {message}
        </div>
      )}

      {/* Pending Tab */}
      {tab === "pending" && (
        <div style={{ maxWidth: "700px" }}>
          {loading && (
            <p style={{ color: "#888" }}>Loading...</p>
          )}
          {!loading && pending.length === 0 && (
            <div style={{ background: "#1a1a1a", padding: "32px",
              borderRadius: "12px", textAlign: "center",
              border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <p style={{ color: "#888" }}>
                No pending reviews! All caught up.
              </p>
            </div>
          )}

          {current && (
            <div>
              {/* Progress */}
              <div style={{ display: "flex", justifyContent: "space-between",
                marginBottom: "16px", color: "#888", fontSize: "14px" }}>
                <span>Reviewing {currentIndex + 1} of {pending.length}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  {pending.map((_, i) => (
                    <div key={i}
                      onClick={() => setCurrentIndex(i)}
                      style={{ width: "8px", height: "8px",
                        borderRadius: "50%", cursor: "pointer",
                        background: i === currentIndex ? "#6c63ff" : "#333" }}
                    />
                  ))}
                </div>
              </div>

              {/* Main review card */}
              <div style={{ background: "#1a1a1a", padding: "24px",
                borderRadius: "12px", marginBottom: "16px",
                border: "1px solid #2a2a2a" }}>

                <h3 style={{ color: "#6c63ff", marginBottom: "16px" }}>
                  {current.question_text}
                </h3>

                <div style={{ background: "#2a2a2a", padding: "16px",
                  borderRadius: "8px", marginBottom: "16px" }}>
                  <p style={{ color: "#888", fontSize: "12px",
                    margin: "0 0 8px 0" }}>STUDENT ANSWER</p>
                  <p style={{ color: "white", margin: 0 }}>
                    {current.student_answer}
                  </p>
                </div>

                <div style={{ background: "#2a2a2a", padding: "16px",
                  borderRadius: "8px", marginBottom: "16px" }}>
                  <p style={{ color: "#888", fontSize: "12px",
                    margin: "0 0 8px 0" }}>AI JUSTIFICATION</p>
                  <p style={{ color: "#ccc", margin: "0 0 8px 0" }}>
                    {current.justification}
                  </p>
                  <p style={{ color: "#4ade80", margin: 0, fontSize: "13px" }}>
                    💡 {current.feedback}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ color: "#888" }}>AI Proposed Score:</span>
                  <span style={{ fontSize: "24px", color: "#6c63ff",
                    fontWeight: "bold" }}>
                    {current.ai_score} / {current.max_marks}
                  </span>
                </div>

                {/* Override input */}
                {overriding && (
                  <div style={{ background: "#2a2a2a", padding: "16px",
                    borderRadius: "8px", marginBottom: "16px" }}>
                    <p style={{ color: "#f59e0b", marginBottom: "8px",
                      fontSize: "14px" }}>
                      Override score (0 - {current.max_marks}):
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="number"
                        min="0"
                        max={current.max_marks}
                        value={overrideScore}
                        onChange={e => setOverrideScore(e.target.value)}
                        placeholder="Enter score"
                        style={{ flex: 1, padding: "8px",
                          background: "#1a1a1a", border: "1px solid #f59e0b",
                          borderRadius: "6px", color: "white" }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleReview("overridden",
                          parseInt(overrideScore))}
                        style={{ padding: "8px 16px",
                          background: "#f59e0b", color: "black",
                          border: "none", borderRadius: "6px",
                          cursor: "pointer" }}>
                        Confirm
                      </button>
                      <button
                        onClick={() => setOverriding(false)}
                        style={{ padding: "8px 16px",
                          background: "transparent", color: "#888",
                          border: "1px solid #444", borderRadius: "6px",
                          cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleReview("approved", current.ai_score)}
                    style={{ flex: 1, padding: "12px",
                      background: "#4ade80", color: "black",
                      border: "none", borderRadius: "8px",
                      cursor: "pointer", fontWeight: "bold",
                      fontSize: "15px" }}>
                    ✅ Approve [A]
                  </button>
                  <button
                    onClick={() => setOverriding(true)}
                    style={{ flex: 1, padding: "12px",
                      background: "#f59e0b", color: "black",
                      border: "none", borderRadius: "8px",
                      cursor: "pointer", fontWeight: "bold",
                      fontSize: "15px" }}>
                    ✏️ Override [O]
                  </button>
                  {currentIndex < pending.length - 1 && (
                    <button
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      style={{ flex: 1, padding: "12px",
                        background: "#1a1a1a", color: "#6c63ff",
                        border: "1px solid #6c63ff", borderRadius: "8px",
                        cursor: "pointer", fontWeight: "bold",
                        fontSize: "15px" }}>
                      Next [N]
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Tab */}
      {tab === "completed" && (
        <div style={{ maxWidth: "700px" }}>
          {completed.length === 0 && (
            <p style={{ color: "#888" }}>No completed reviews yet.</p>
          )}
          {completed.map((result, i) => (
            <div key={i} style={{ background: "#1a1a1a", padding: "20px",
              borderRadius: "12px", marginBottom: "12px",
              border: "1px solid #2a2a2a" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                marginBottom: "8px" }}>
                <span style={{ color: "#ccc", fontWeight: "bold",
                  fontSize: "14px" }}>
                  {result.question_text}
                </span>
                <span style={{ padding: "2px 10px", borderRadius: "12px",
                  fontSize: "12px",
                  background: result.status === "approved"
                    ? "#14532d" : "#78350f",
                  color: result.status === "approved"
                    ? "#4ade80" : "#f59e0b" }}>
                  {result.status}
                </span>
              </div>
              <p style={{ color: "#555", fontSize: "13px",
                margin: "0 0 8px 0", fontStyle: "italic" }}>
                "{result.student_answer}"
              </p>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                <span style={{ color: "#888" }}>
                  AI Score: <span style={{ color: "white" }}>
                    {result.ai_score}/{result.max_marks}
                  </span>
                </span>
                <span style={{ color: "#888" }}>
                  Final Score: <span style={{ color: "#6c63ff",
                    fontWeight: "bold" }}>
                    {result.final_score}/{result.max_marks}
                  </span>
                </span>
                <span style={{ color: "#888" }}>
                  By: <span style={{ color: "white" }}>
                    {result.reviewed_by}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Review;