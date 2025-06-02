import React, { useState } from "react";

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "200px" : "0",
          backgroundColor: "rgba(79, 70, 229, 0.15)", // transparent purple
          color: '#1a1a1a',
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          transition: "width 0.3s, background-color 0.3s",
          overflow: "hidden",
          padding: sidebarOpen ? "1rem" : "0",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>💘 Menu</h2>

        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {["👤 My Profile", "❤️ My Crush"].map((item, index) => (
              <li
                key={index}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "1rem",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {item}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "auto" }}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {["ℹ️ About Us", "⚙️ Settings", "📞 Contact", "📧 Contact Us"].map(
                (item, index) => (
                  <li
                    key={index}
                    style={{
                      cursor: "pointer",
                      padding: "0.5rem 0",
                      borderTop: "1px solid rgba(255,255,255,0.2)",
                      fontSize: "0.85rem",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flexGrow: 1,
          backgroundColor: "#f9f5ff",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1rem",
          position: "relative",
          height: "100vh",
        }}
      >
        {/* Navbar */}
        <nav
          style={{
            width: "100%",
            maxWidth: "900px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            flexShrink: 0,
            backgroundColor: "#fff",
            padding: "0.5rem 1.5rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            borderRadius: "0.5rem",
          }}
        >
          {/* Menu Button */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "35px",
              height: "35px",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="4" width="24" height="2" rx="1" fill="#4f46e5" />
              <rect y="11" width="24" height="2" rx="1" fill="#4f46e5" />
              <rect y="18" width="24" height="2" rx="1" fill="#4f46e5" />
            </svg>
          </button>

          {/* App Name */}
          <h1
            style={{
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              fontWeight: "700",
              fontSize: "1.75rem",
              color: "#4f46e5",
              margin: 0,
              userSelect: "none",
              letterSpacing: "0.05em",
              flexGrow: 1,
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            CampusCrush
          </h1>

          {/* Login Button */}
          <button
            style={{
              background: "transparent",
              border: "2px solid #4f46e5",
              color: "#4f46e5",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
              transition: "background-color 0.2s, color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#4f46e5";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#4f46e5";
            }}
          >
            Login
          </button>
        </nav>

        {/* Centered Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
              width: "100%",
            }}
          >
            <h1 style={{ fontSize: "2rem", color: "#4f46e5", marginBottom: "1rem" }}>
              💖 Welcome to Crush Finder!
            </h1>
            <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>
              Secretly like someone at Poornima University? Tap “Send Crush” — and if they like you
              back, it’s a match made in PU! 💫
            </p>

            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "1rem",
                borderRadius: "0.75rem",
                color: "#374151",
              }}
            >
              💡 Tip: No one sees your crush unless it’s mutual. 100% private and fun!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
