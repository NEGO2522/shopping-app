import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const sidebarRef = useRef(null);

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full bg-violet-700 text-white transition-all duration-300 z-50 ${
        sidebarOpen ? "w-52 p-4" : "w-0 p-0 overflow-hidden"
      }`}
    >
      {/* Close Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-white hover:text-red-300"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="text-xl font-bold mb-6 mt-2">💘</div>

      <div className="flex flex-col h-full justify-between">
        {/* Top Menu Section */}
        <div>
          <h2 className="text-sm uppercase tracking-wide mb-2 text-white/80 px-2">
            Main
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/home"
                onClick={() => setSidebarOpen(false)}
                className="block border-b border-white/30 cursor-pointer hover:bg-white/10 py-2 px-2 rounded"
              >
                👤 Home
              </Link>
            </li>
            <li>
              <Link
                to="/my-crush"
                onClick={() => setSidebarOpen(false)}
                className="block border-b border-white/30 cursor-pointer hover:bg-white/10 py-2 px-2 rounded"
              >
                ❤️ My Crush
              </Link>
            </li>
          </ul>
        </div>

        {/* Bottom Menu Section */}
        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-wide mb-2 text-white/80 px-2">
            More
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/about-us"
                onClick={() => setSidebarOpen(false)}
                className="block cursor-pointer hover:bg-white/10 py-2 px-2 rounded"
              >
                ℹ️ About Us
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                onClick={() => setSidebarOpen(false)}
                className="block cursor-pointer hover:bg-white/10 py-2 px-2 rounded"
              >
                ⚙️ Settings
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setSidebarOpen(false)}
                className="block cursor-pointer hover:bg-white/10 py-2 px-2 rounded"
              >
                📞 Contact
              </Link>
            </li>
            <li>
              <Link
                to="/contact-us"
                onClick={() => setSidebarOpen(false)}
                className="block cursor-pointer hover:bg-white/10 py-2 px-2 rounded"
              >
                📧 Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
