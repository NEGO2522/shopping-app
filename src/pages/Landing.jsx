import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fdf2f8",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "#fff",
          borderRadius: "1.5rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#be185d",
            marginBottom: "1rem",
          }}
        >
          💘 Welcome to CrushConnect
        </h1>
        <h2
          style={{
            fontSize: "1.25rem",
            color: "#6b21a8",
            marginBottom: "1rem",
          }}
        >
          Discover mutual feelings — Only at Poornima University
        </h2>
        <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1rem" }}>
          Secretly like someone? Let’s find out if they feel the same — anonymously and securely.
        </p>

        <button
          onClick={handleGetStarted}
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            backgroundColor: "#ec4899",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
          }}
        >
          💫 Get Started
        </button>

        <p
          style={{
            marginTop: "1.5rem",
            fontStyle: "italic",
            color: "#9ca3af",
            fontSize: "0.9rem",
          }}
        >
          🔒 100% anonymous. Revealed only if both crush ❤️
        </p>
      </div>
    </div>
  );
}

export default Landing;
