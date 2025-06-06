import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const sidebarRef = useRef(null);
  const scrollPosition = useRef(0);

  // Enhanced scroll lock effect
  useEffect(() => {
    if (sidebarOpen) {
      // Store current scroll position
      scrollPosition.current = window.scrollY;
      
      // Apply scroll lock styles to body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = '100%';
    } else {
      // Remove scroll lock styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollPosition.current);
    }

    return () => {
      // Cleanup
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition.current);
    };
  }, [sidebarOpen]);

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
      className={`fixed top-0 left-0 h-full bg-gray-100 text-gray-800 transition-all duration-300 z-50 ${
        sidebarOpen ? "w-52 md:w-64" : "w-0"
      }`}
    >
      <div className={`h-full overflow-y-auto ${sidebarOpen ? "p-4" : "p-0 overflow-hidden"}`}>
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-800 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col h-full justify-between">
          {/* Top Menu Section */}
          <div>
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex justify-center mt-8 mb-8 cursor-pointer hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl text-gray-600">👤</span>
              </div>
            </Link>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/home"
                  onClick={() => setSidebarOpen(false)}
                  className="block border-b border-gray-600 cursor-pointer hover:bg-white hover:text-gray-800 py-2 px-2 rounded-lg flex items-center space-x-2"
                >
                  <span className="text-gray-600">👤</span>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-crushes"
                  onClick={() => setSidebarOpen(false)}
                  className="block border-b border-gray-600 cursor-pointer hover:bg-white hover:text-gray-800 py-2 px-2 rounded-lg flex items-center space-x-2"
                >
                  <span className="text-gray-600">❤️</span>
                  <span>My Crush</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-posts"
                  onClick={() => setSidebarOpen(false)}
                  className="block border-b border-gray-600 cursor-pointer hover:bg-white hover:text-gray-800 py-2 px-2 rounded-lg flex items-center space-x-2"
                >
                  <span className="text-gray-600">💭</span>
                  <span>My Posts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Bottom Menu Section */}
          <div className="mt-8">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about-us"
                  onClick={() => setSidebarOpen(false)}
                  className="block border-b border-gray-600 cursor-pointer hover:bg-white hover:text-gray-800 py-2 px-2 rounded-lg flex items-center space-x-2"
                >
                  <span className="text-gray-600">ℹ️</span>
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className="block border-b border-gray-600 cursor-pointer hover:bg-white hover:text-gray-800 py-2 px-2 rounded-lg flex items-center space-x-2"
                >
                  <span className="text-gray-600">⚙️</span>
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => setSidebarOpen(false)}
                  className="block border-b border-gray-600 cursor-pointer hover:bg-white hover:text-gray-800 py-2 px-2 rounded-lg flex items-center space-x-2"
                >
                  <span className="text-gray-600">📞</span>
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 