import React from "react";

function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9f5ff",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#7c3aed",
          marginBottom: "1rem",
        }}
      >
        💖 Welcome to Your Secret Space!
      </h1>

      <h2
        style={{
          fontSize: "1.25rem",
          color: "#6b7280",
          marginBottom: "2rem",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        This is the home of mutual sparks ✨ at Poornima University. Send anonymous crushes — and if they like you back, magic happens!
      </h2>

      <div
        style={{
          background: "#fff",
          borderRadius: "1rem",
          padding: "2rem",
          maxWidth: "600px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          textAlign: "left",
          width: "100%",
        }}
      >
        <h3 style={{ color: "#4f46e5", marginBottom: "1rem" }}>📌 How It Works:</h3>
        <ul style={{ lineHeight: "1.8", color: "#374151", fontSize: "1rem" }}>
          <li>✅ Browse student profiles of Poornima University.</li>
          <li>✅ Tap “Send Crush” if you like someone.</li>
          <li>✅ They’ll get a message: “Someone has a crush on you!” (no name revealed).</li>
          <li>✅ If they also crush on you, you both get matched 🎉</li>
          <li>🚫 No one will know unless the crush is mutual. 100% private & safe.</li>
        </ul>

        <p
          style={{
            marginTop: "2rem",
            fontStyle: "italic",
            color: "#9ca3af",
            fontSize: "0.9rem",
          }}
        >
          💡 Soon you'll be able to search names, send crushes, and check your secret admirers.
        </p>
      </div>
    </div>
  );
}

export default Home;
