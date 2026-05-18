import { useState, useEffect } from "react";

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [exams, setExams] = useState([]);

  useEffect(() => {
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

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload-exam", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        fetchExams();
      } else {
        setError(data.detail || "Upload failed");
      }
    } catch (err) {
      setError("Cannot connect to backend");
    }
    setUploading(false);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "8px" }}>Upload Exam</h2>
      <p style={{ color: "#888", marginBottom: "24px" }}>
        Upload a PDF of scanned exam sheets
      </p>

      {/* Upload Box */}
      <div style={{ background: "#1a1a1a", padding: "32px",
        borderRadius: "12px", border: "2px dashed #333",
        maxWidth: "500px", marginBottom: "24px", textAlign: "center" }}>
        
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
        
        <input
          type="file"
          accept=".pdf"
          onChange={e => setFile(e.target.files[0])}
          style={{ marginBottom: "16px", color: "white" }}
        />

        {file && (
          <p style={{ color: "#6c63ff", marginBottom: "16px", fontSize: "14px" }}>
            Selected: {file.name}
          </p>
        )}

        {error && (
          <p style={{ color: "#ff6b6b", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ padding: "12px 32px", background: uploading ? "#444" : "#6c63ff",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "16px", cursor: uploading ? "not-allowed" : "pointer" }}>
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{ background: "#1a1a1a", padding: "24px",
          borderRadius: "12px", maxWidth: "500px", marginBottom: "24px",
          border: "1px solid #2a2a2a" }}>
          <h3 style={{ color: "#4ade80", marginBottom: "16px" }}>
            ✅ Upload Successful!
          </h3>
          <p style={{ color: "#888", marginBottom: "8px" }}>
            File: <span style={{ color: "white" }}>{result.filename}</span>
          </p>
          <p style={{ color: "#888", marginBottom: "16px" }}>
            Pages extracted: <span style={{ color: "white" }}>{result.total_pages}</span>
          </p>
          
          {/* Page previews */}
          <h4 style={{ marginBottom: "12px" }}>Page Previews:</h4>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {result.pages.map((page, i) => (
              <img
                key={i}
                src={`http://localhost:8000/uploads/${page}`}
                alt={`Page ${i + 1}`}
                style={{ width: "120px", height: "160px",
                  objectFit: "cover", borderRadius: "4px",
                  border: "1px solid #333" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Previous Exams */}
      {exams.length > 0 && (
        <div style={{ background: "#1a1a1a", padding: "24px",
          borderRadius: "12px", maxWidth: "500px",
          border: "1px solid #2a2a2a" }}>
          <h3 style={{ marginBottom: "16px" }}>Previously Uploaded Exams</h3>
          {exams.map((exam, i) => (
            <div key={i} style={{ padding: "12px",
              background: "#2a2a2a", borderRadius: "8px",
              marginBottom: "8px", display: "flex",
              justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#888", fontSize: "14px" }}>📄 {exam}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Upload;