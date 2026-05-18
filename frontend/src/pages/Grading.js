import { useState, useEffect } from "react";

function Grading() {
  const [rubrics, setRubrics] = useState([]);
  const [selectedRubric, setSelectedRubric] = useState(null);
  const [answers, setAnswers] = useState({});
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    try {
      const res = await fetch("http://localhost:8000/rubrics");
      const data = await res.json();
      setRubrics(data.rubrics);
    } catch (err) {
      setError("Cannot connect to backend");
    }
  };

  const handleSelectRubric = (rubric) => {
    setSelectedRubric(rubric);
    setResults([]);
    setAnswers({});
    setSubmitted(false);
  };

  const handleGrade = async () => {
    if (!selectedRubric) {
      setError("Please select a rubric");
      return;
    }
    for (const q of selectedRubric.questions) {
      if (!answers[q.id]) {
        setError("Please fill in all student answers");
        return;
      }
    }
    setGrading(true);
    setError("");
    setResults([]);

    const gradeResults = [];
    for (const question of selectedRubric.questions) {
      try {
        const res = await fetch("http://localhost:8000/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exam_id: selectedRubric.id,
            question_id: question.id,
            question_text: question.question_text,
            max_marks: question.max_marks,
            grading_criteria: question.grading_criteria,
            student_answer: answers[question.id]
          })
        });
        const data = await res.json();
        gradeResults.push({
          result_id: data.result_id,
          question: question.question_text,
          max_marks: question.max_marks,
          student_answer: answers[question.id],
          ...data
        });
      } catch (err) {
        gradeResults.push({
          question: question.question_text,
          max_marks: question.max_marks,
          score: 0,
          justification: "Grading failed",
          feedback: ""
        });
      }
    }
    setResults(gradeResults);
    setGrading(false);
    setSubmitted(true);
  };

  const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
  const totalMax = results.reduce((sum, r) => sum + r.max_marks, 0);

  const inputStyle = {
    width: "100%", padding: "10px",
    background: "#2a2a2a", border: "1px solid #333",
    borderRadius: "8px", color: "white",
    boxSizing: "border-box", marginBottom: "8px"
  };

  return (
    <div>
      <h2 style={{ marginBottom: "8px" }}>AI Grading</h2>
      <p style={{ color: "#888", marginBottom: "24px" }}>
        Grade student answers using Groq AI
      </p>

      <div style={{ background: "#1a1a1a", padding: "24px",
        borderRadius: "12px", maxWidth: "700px",
        marginBottom: "24px", border: "1px solid #2a2a2a" }}>
        <h3 style={{ marginBottom: "16px" }}>Select Exam Rubric</h3>
        {rubrics.length === 0 && (
          <p style={{ color: "#888" }}>No rubrics found. Create one first.</p>
        )}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {rubrics.map((rubric, i) => (
            <div key={i} onClick={() => handleSelectRubric(rubric)}
              style={{ padding: "12px 16px", background: "#2a2a2a",
                borderRadius: "8px", cursor: "pointer",
                border: selectedRubric?.id === rubric.id
                  ? "1px solid #6c63ff" : "1px solid #333",
                color: selectedRubric?.id === rubric.id ? "#6c63ff" : "#ccc" }}>
              📄 {rubric.filename}
            </div>
          ))}
        </div>
      </div>

      {selectedRubric && !submitted && (
        <div style={{ maxWidth: "700px" }}>
          <h3 style={{ marginBottom: "16px" }}>Enter Student Answers</h3>
          {selectedRubric.questions.map((q, i) => (
            <div key={i} style={{ background: "#1a1a1a", padding: "24px",
              borderRadius: "12px", marginBottom: "16px",
              border: "1px solid #2a2a2a" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                marginBottom: "12px" }}>
                <span style={{ color: "#6c63ff", fontWeight: "bold" }}>
                  Q{i + 1}: {q.question_text}
                </span>
                <span style={{ color: "#888", fontSize: "13px" }}>
                  {q.max_marks} marks
                </span>
              </div>
              <label style={{ color: "#888", fontSize: "13px" }}>
                Student's Answer
              </label>
              <textarea
                placeholder="Type or paste the student's answer here..."
                value={answers[q.id] || ""}
                onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: "#ff6b6b", marginBottom: "12px" }}>{error}</p>
          )}

          <button onClick={handleGrade} disabled={grading}
            style={{ width: "100%", padding: "14px",
              background: grading ? "#444" : "#6c63ff",
              color: "white", border: "none", borderRadius: "8px",
              fontSize: "16px", cursor: grading ? "not-allowed" : "pointer",
              marginBottom: "24px" }}>
            {grading ? "Grading with AI..." : "Grade with Groq AI"}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ maxWidth: "700px" }}>
          <div style={{ background: "#1a1a1a", padding: "20px",
            borderRadius: "12px", marginBottom: "16px",
            border: "1px solid #6c63ff",
            display: "flex", justifyContent: "space-between",
            alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0" }}>Grading Complete!</h3>
              <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>
                Results saved — TA can now review in Review Dashboard
              </p>
            </div>
            <span style={{ fontSize: "32px", color: "#6c63ff", fontWeight: "bold" }}>
              {totalScore} / {totalMax}
            </span>
          </div>

          {results.map((result, i) => (
            <div key={i} style={{ background: "#1a1a1a", padding: "20px",
              borderRadius: "12px", marginBottom: "12px",
              border: "1px solid #2a2a2a" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                marginBottom: "8px" }}>
                <span style={{ color: "#ccc", fontWeight: "bold" }}>
                  Q{i + 1}: {result.question}
                </span>
                <span style={{ color: "#6c63ff", fontWeight: "bold",
                  whiteSpace: "nowrap", marginLeft: "8px" }}>
                  {result.score} / {result.max_marks}
                </span>
              </div>
              <p style={{ color: "#555", fontSize: "13px",
                margin: "0 0 8px 0", fontStyle: "italic" }}>
                Student: "{result.student_answer}"
              </p>
              <p style={{ color: "#888", fontSize: "14px", margin: "0 0 8px 0" }}>
                {result.justification}
              </p>
              {result.feedback && (
                <p style={{ color: "#4ade80", fontSize: "13px", margin: 0 }}>
                  💡 {result.feedback}
                </p>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              setSubmitted(false);
              setResults([]);
              setAnswers({});
            }}
            style={{ width: "100%", padding: "12px",
              background: "transparent", color: "#6c63ff",
              border: "1px solid #6c63ff", borderRadius: "8px",
              cursor: "pointer", marginTop: "8px" }}>
            Grade Another Student
          </button>
        </div>
      )}
    </div>
  );
}

export default Grading;