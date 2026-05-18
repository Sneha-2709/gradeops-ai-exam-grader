import { useState } from "react";
import Dashboard from "./pages/Dashboard";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("instructor");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setMessage("Please fill in all fields");
      return;
    }
    setLoading(true);
    setMessage("");

    const url = isRegistering
      ? "http://localhost:8000/register"
      : "http://localhost:8000/login";
    const body = isRegistering
      ? { email, password, role }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        if (!isRegistering) {
          localStorage.setItem("token", data.access_token);
          setLoggedIn(true);
          setUserRole(data.role);
        } else {
          setMessage("Registered successfully! Now login.");
          setIsRegistering(false);
        }
      } else {
        setMessage(data.detail || "Something went wrong");
      }
    } catch (err) {
      setMessage("Cannot connect to backend");
    }
    setLoading(false);
  };

  if (loggedIn) {
    return (
      <Dashboard
        userRole={userRole}
        userEmail={email}
        onLogout={() => {
          setLoggedIn(false);
          setEmail("");
          setPassword("");
        }}
      />
    );
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1a1a1a", padding: "40px",
        borderRadius: "12px", width: "360px",
        border: "1px solid #2a2a2a" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "#6c63ff", margin: "0 0 4px 0",
            fontSize: "32px", letterSpacing: "2px" }}>
            GRADEOPS
          </h1>
          <p style={{ color: "#555", margin: 0, fontSize: "13px" }}>
            AI-Powered Exam Grading System
          </p>
        </div>

        <p style={{ color: "#666", marginBottom: "24px",
          textAlign: "center", fontSize: "14px" }}>
          {isRegistering ? "Create your account" : "Sign in to continue"}
        </p>

        <input
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", padding: "12px", marginBottom: "12px",
            background: "#2a2a2a", border: "1px solid #333",
            borderRadius: "8px", color: "white",
            boxSizing: "border-box", outline: "none" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", padding: "12px", marginBottom: "12px",
            background: "#2a2a2a", border: "1px solid #333",
            borderRadius: "8px", color: "white",
            boxSizing: "border-box", outline: "none" }}
        />

        {isRegistering && (
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{ width: "100%", padding: "12px", marginBottom: "12px",
              background: "#2a2a2a", border: "1px solid #333",
              borderRadius: "8px", color: "white",
              boxSizing: "border-box" }}>
            <option value="instructor">Instructor</option>
            <option value="ta">Teaching Assistant</option>
          </select>
        )}

        {message && (
          <p style={{ color: message.includes("success") ? "#4ade80" : "#ff6b6b",
            marginBottom: "12px", fontSize: "14px", textAlign: "center" }}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "12px",
            background: loading ? "#444" : "#6c63ff",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "16px", cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "12px", fontWeight: "bold" }}>
          {loading ? "Please wait..." : isRegistering ? "Register" : "Login"}
        </button>

        <p onClick={() => { setIsRegistering(!isRegistering); setMessage(""); }}
          style={{ color: "#6c63ff", textAlign: "center",
            cursor: "pointer", fontSize: "14px", margin: 0 }}>
          {isRegistering
            ? "Already have an account? Login"
            : "No account? Register here"}
        </p>
      </div>
    </div>
  );
}

export default App;