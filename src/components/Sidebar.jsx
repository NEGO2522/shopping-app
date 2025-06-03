import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const sidebarRef = useRef(null);

  // Handle click outside
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
        >
          <X size={20} />
        </button>
      </div>

      <div className="text-xl font-bold mb-6 mt-2">💘</div>
      <div className="flex flex-col h-full justify-between">
        {/* Top Menu */}
        <ul className="space-y-4 text-white text-base">
          {["👤 My Profile", "❤️ My Crush"].map((item, idx) => (
            <li
              key={idx}
              className="border-b border-white/30 cursor-pointer hover:bg-white/10 py-2 px-2 rounded"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Bottom Menu */}
        <ul className="space-y-4 text-white text-sm mt-6 pt-4 border-t border-white/30">
          {["ℹ️ About Us", "⚙️ Settings", "📞 Contact", "📧 Contact Us"].map((item, idx) => (
            <li
              key={idx}
              className="cursor-pointer hover:bg-white/10 py-2 px-2 rounded"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
