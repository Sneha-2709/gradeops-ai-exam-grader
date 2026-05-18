import { useState, useEffect } from "react";

function RubricBuilder({ userEmail }) {
  const [filename, setFilename] = useState("");
  const [questions, setQuestions] = useState([
    { question_text: "", max_marks: 10, grading_criteria: "" }
  ]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [rubrics, setRubrics] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchRubrics();
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch("http://localhost:8000/exams");
      const data = await res.json();
      setExams(data.exams);
    } catch (err) {
      console.log("Could not fetch exams");
    }
  };

  const fetchRubrics = async () => {
    try {
      const res = await fetch("http://localhost:8000/rubrics");
      const data = await res.json();
      setRubrics(data.rubrics);
    } catch (err) {
      console.log("Could not fetch rubrics");
    }
  };

  const addQuestion = () => {
    setQuestions([...questions,
      { question_text: "", max_marks: 10, grading_criteria: "" }
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!filename) {
      setMessage("Please select an exam file");
      return;
    }
    if (questions.some(q => !q.question_text || !q.grading_criteria)) {
      setMessage("Please fill all question fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          created_by: userEmail || "instructor",
          questions
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage("Rubric saved successfully!");
        fetchRubrics();
        setQuestions([{ question_text: "", max_marks: 10, grading_criteria: "" }]);
      } else {
        setMessage(data.detail || "Failed to save rubric");
      }
    } catch (err) {
      setMessage("Cannot connect to backend");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px",
    background: "#2a2a2a", border: "1px solid #333",
    borderRadius: "8px", color: "white",
    boxSizing: "border-box", marginBottom: "8px"
  };

  return (
    <div>
      <h2 style={{ marginBottom: "8px" }}>Rubric Builder</h2>
      <p style={{ color: "#888", marginBottom: "24px" }}>
        Define questions and grading criteria for an exam
      </p>

      {/* Select Exam */}
      <div style={{ background: "#1a1a1a", padding: "24px",
        borderRadius: "12px", maxWidth: "700px", marginBottom: "24px",
        border: "1px solid #2a2a2a" }}>
        <h3 style={{ marginBottom: "16px" }}>Select Exam File</h3>
        <select
          value={filename}
          onChange={e => setFilename(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0 }}>
          <option value="">-- Select uploaded exam --</option>
          {exams.map((exam, i) => (
            <option key={i} value={exam}>{exam}</option>
          ))}
        </select>
      </div>

      {/* Questions */}
      <div style={{ maxWidth: "700px" }}>
        {questions.map((q, index) => (
          <div key={index} style={{ background: "#1a1a1a", padding: "24px",
            borderRadius: "12px", marginBottom: "16px",
            border: "1px solid #2a2a2a" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#6c63ff" }}>
                Question {index + 1}
              </h3>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(index)}
                  style={{ padding: "4px 12px", background: "transparent",
                    color: "#ff6b6b", border: "1px solid #ff6b6b",
                    borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                  Remove
                </button>
              )}
            </div>

            <label style={{ color: "#888", fontSize: "13px" }}>
              Question Text
            </label>
            <textarea
              placeholder="e.g. Explain the water cycle"
              value={q.question_text}
              onChange={e => updateQuestion(index, "question_text", e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <label style={{ color: "#888", fontSize: "13px" }}>
              Max Marks
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={q.max_marks}
              onChange={e => updateQuestion(index, "max_marks", parseInt(e.target.value))}
              style={inputStyle}
            />

            <label style={{ color: "#888", fontSize: "13px" }}>
              Grading Criteria
            </label>
            <textarea
              placeholder="e.g. Award 5 marks for mentioning evaporation, 3 marks for condensation, 2 marks for precipitation"
              value={q.grading_criteria}
              onChange={e => updateQuestion(index, "grading_criteria", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <div style={{ color: "#6c63ff", fontSize: "13px" }}>
              Total marks for this question: {q.max_marks}
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button
          onClick={addQuestion}
          style={{ width: "100%", padding: "12px",
            background: "transparent", color: "#6c63ff",
            border: "2px dashed #6c63ff", borderRadius: "8px",
            cursor: "pointer", fontSize: "16px", marginBottom: "16px" }}>
          + Add Another Question
        </button>

        {/* Total marks summary */}
        <div style={{ background: "#1a1a1a", padding: "16px",
          borderRadius: "8px", marginBottom: "16px",
          border: "1px solid #2a2a2a", display: "flex",
          justifyContent: "space-between" }}>
          <span style={{ color: "#888" }}>Total Questions:</span>
          <span style={{ color: "white" }}>{questions.length}</span>
          <span style={{ color: "#888" }}>Total Marks:</span>
          <span style={{ color: "#6c63ff", fontWeight: "bold" }}>
            {questions.reduce((sum, q) => sum + (q.max_marks || 0), 0)}
          </span>
        </div>

        {message && (
          <p style={{ color: success ? "#4ade80" : "#ff6b6b",
            marginBottom: "12px", fontSize: "14px" }}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          style={{ width: "100%", padding: "14px",
            background: "#6c63ff", color: "white",
            border: "none", borderRadius: "8px",
            fontSize: "16px", cursor: "pointer" }}>
          Save Rubric
        </button>
      </div>

      {/* Saved Rubrics */}
      {rubrics.length > 0 && (
        <div style={{ maxWidth: "700px", marginTop: "32px" }}>
          <h3 style={{ marginBottom: "16px" }}>Saved Rubrics</h3>
          {rubrics.map((rubric, i) => (
            <div key={i} style={{ background: "#1a1a1a", padding: "20px",
              borderRadius: "12px", marginBottom: "12px",
              border: "1px solid #2a2a2a" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                marginBottom: "12px" }}>
                <span style={{ color: "white", fontWeight: "bold" }}>
                  📄 {rubric.filename}
                </span>
                <span style={{ color: "#888", fontSize: "13px" }}>
                  {rubric.questions.length} questions
                </span>
              </div>
              {rubric.questions.map((q, j) => (
                <div key={j} style={{ background: "#2a2a2a", padding: "12px",
                  borderRadius: "8px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#ccc", fontSize: "14px" }}>
                      Q{j + 1}: {q.question_text}
                    </span>
                    <span style={{ color: "#6c63ff", fontSize: "13px",
                      whiteSpace: "nowrap", marginLeft: "8px" }}>
                      {q.max_marks} marks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RubricBuilder;