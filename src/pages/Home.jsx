import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f9f5ff",
      }}
    >
      {/* Navbar */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "50%",
          height: "4.5rem",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#4f46e5",
          }}
        >
          <Menu size={26} />
        </button>

        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#4f46e5",
            fontFamily: "Arial, sans-serif",
          }}
        >
          CampusCrush
        </h1>

        <Link to="/login" style={{ textDecoration: "none" }}>
          <button
            style={{
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              padding: "0.4rem 1.2rem",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#4338ca")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#4f46e5")
            }
          >
            Login
          </button>
        </Link>
      </div>

      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "200px" : "0",
          background: "rgba(79, 70, 229, 0.8)",
          color: "#ffffff",
          transition: "width 0.3s",
          overflow: "hidden",
          padding: sidebarOpen ? "1rem" : "0",
          position: "absolute",
          height: "100%",
          top: "0",
          left: "0",
          zIndex: 999,
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            marginBottom: "1.5rem",
            fontWeight: "bold",
          }}
        >
          💘
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Top menu items */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              color: "#ffffff",
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
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {item}
              </li>
            ))}
          </ul>

          {/* Bottom items */}
          <div style={{ marginTop: "auto" }}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                color: "#ffffff",
              }}
            >
              {[
                "ℹ️ About Us",
                "⚙️ Settings",
                "📞 Contact",
                "📧 Contact Us",
              ].map((item, index) => (
                <li
                  key={index}
                  style={{
                    cursor: "pointer",
                    padding: "0.5rem 0",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "0.85rem",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.1)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          height: "calc(100vh - 4.5rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
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
          }}
        >
          <h1
            style={{ fontSize: "2rem", color: "#4f46e5", marginBottom: "1rem" }}
          >
            💖 Welcome to Crush Finder!
          </h1>
          <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>
            Secretly like someone at Poornima University? Tap “Send Crush” — and
            if they like you back, it’s a match made in PU! 💫
          </p>

          <div
            style={{
              backgroundColor: "#f3f4f6",
              padding: "1rem",
              borderRadius: "0.75rem",
              color: "#374151",
            }}
          >
            💡 Tip: No one sees your crush unless it’s mutual. 100% private and
            fun!
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
