import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

const Navbar = ({ toggleSidebar }) => {
  return (
    <div className="w-full h-18 bg-white flex items-center justify-between px-4 shadow-md relative z-40">
      <button
        onClick={toggleSidebar}
        className="text-violet-700 hover:text-violet-900"
      >
        <Menu size={26} />
      </button>

      <h1 className="text-2xl font-bold text-violet-700">CampusCrush</h1>

      <Link to="/login">
        <button className="bg-violet-700 hover:bg-violet-800 text-white py-2 px-4 rounded text-sm">
          Login
        </button>
      </Link>
    </div>
  );
};

export default Navbar;
