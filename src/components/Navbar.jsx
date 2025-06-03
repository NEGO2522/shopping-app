import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { Menu } from "lucide-react";

const Navbar = ({ toggleSidebar, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const auth = getAuth();

  const getInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "?";
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full h-18 bg-white flex items-center justify-between px-4 shadow-md relative z-40">
      <button onClick={toggleSidebar} className="text-violet-700 hover:text-violet-900 cursor-pointer">
  {/* <Sidebar size={26} className="text-violet-700 hover:text-violet-900" /> */}
  <Menu size={26} />
</button>


      <h1 className="text-2xl font-bold text-violet-700">CampusCrush</h1>

      {user ? (
        <div className="relative" ref={menuRef}>
          <button
  onClick={() => setMenuOpen((prev) => !prev)}
  className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-600 text-white font-semibold focus:outline-none cursor-pointer"
>
  {getInitial()}
</button>

{menuOpen && (
  <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md py-2 z-50">
    <Link
      to="/profile"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-100"
      onClick={() => setMenuOpen(false)}
    >
      Profile
    </Link>
    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-violet-100 cursor-pointer"
    >
      Logout
    </button>
  </div>
)}

        </div>
      ) : (
        <Link to="/login">
          <button className="bg-violet-700 hover:bg-violet-800 text-white py-2 px-4 rounded text-sm">
            Login
          </button>
        </Link>
      )}
    </div>
  );
};

export default Navbar;
