import { useState } from "react";
import Upload from "./Upload";
import RubricBuilder from "./RubricBuilder";
import Grading from "./Grading";
import Review from "./Review";

function Dashboard({ userRole, userEmail, onLogout }) {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "white" }}>

      {/* Navbar */}
      <div style={{ background: "#1a1a1a", padding: "16px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid #333" }}>
        <h2 style={{ color: "#6c63ff", margin: 0, cursor: "pointer" }}
          onClick={() => setCurrentPage("home")}>
          GRADEOPS
        </h2>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span onClick={() => setCurrentPage("home")}
            style={{ cursor: "pointer",
              color: currentPage === "home" ? "#6c63ff" : "#888" }}>
            Home
          </span>
          {userRole === "instructor" && (
            <>
              <span onClick={() => setCurrentPage("upload")}
                style={{ cursor: "pointer",
                  color: currentPage === "upload" ? "#6c63ff" : "#888" }}>
                Upload Exam
              </span>
              <span onClick={() => setCurrentPage("rubric")}
                style={{ cursor: "pointer",
                  color: currentPage === "rubric" ? "#6c63ff" : "#888" }}>
                Rubric Builder
              </span>
              <span onClick={() => setCurrentPage("grading")}
                style={{ cursor: "pointer",
                  color: currentPage === "grading" ? "#6c63ff" : "#888" }}>
                AI Grading
              </span>
            </>
          )}
          <span onClick={() => setCurrentPage("review")}
            style={{ cursor: "pointer",
              color: currentPage === "review" ? "#6c63ff" : "#888" }}>
            TA Review
          </span>
          <span style={{ color: "#555" }}>|</span>
          <span style={{ color: "#888", fontSize: "14px" }}>{userRole}</span>
          <button onClick={onLogout}
            style={{ padding: "8px 16px", background: "transparent",
              color: "#ff6b6b", border: "1px solid #ff6b6b",
              borderRadius: "6px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "32px" }}>
        {currentPage === "home" && (
          <div>
            <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
              Welcome to GradeOps
            </h1>
            <p style={{ color: "#888", marginBottom: "32px" }}>
              AI-powered exam grading system
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div onClick={() => setCurrentPage("upload")}
                style={{ background: "#1a1a1a", padding: "24px",
                  borderRadius: "12px", width: "200px",
                  border: "1px solid #333", cursor: "pointer" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
                <h3 style={{ margin: "0 0 8px 0" }}>Upload Exams</h3>
                <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
                  Upload bulk PDF scans
                </p>
              </div>
              <div onClick={() => setCurrentPage("rubric")}
                style={{ background: "#1a1a1a", padding: "24px",
                  borderRadius: "12px", width: "200px",
                  border: "1px solid #333", cursor: "pointer" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📝</div>
                <h3 style={{ margin: "0 0 8px 0" }}>Rubric Builder</h3>
                <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
                  Define grading criteria
                </p>
              </div>
              <div onClick={() => setCurrentPage("grading")}
                style={{ background: "#1a1a1a", padding: "24px",
                  borderRadius: "12px", width: "200px",
                  border: "1px solid #333", cursor: "pointer" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🤖</div>
                <h3 style={{ margin: "0 0 8px 0" }}>AI Grading</h3>
                <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
                  Auto grade with Groq AI
                </p>
              </div>
              <div onClick={() => setCurrentPage("review")}
                style={{ background: "#1a1a1a", padding: "24px",
                  borderRadius: "12px", width: "200px",
                  border: "1px solid #333", cursor: "pointer" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                <h3 style={{ margin: "0 0 8px 0" }}>TA Review</h3>
                <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
                  Approve or override grades
                </p>
              </div>
            </div>
          </div>
        )}
        {currentPage === "upload" && <Upload />}
        {currentPage === "rubric" && <RubricBuilder userEmail={userEmail} />}
        {currentPage === "grading" && <Grading />}
        {currentPage === "review" && <Review userEmail={userEmail} />}
      </div>
    </div>
  );
}

export default Dashboard;