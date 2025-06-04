import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { Menu, Bell } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const Navbar = ({ toggleSidebar, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const menuRef = useRef(null);

  const auth = getAuth();

  useEffect(() => {
    if (!user?.email) return;

    // Convert email to safe path
    const safeEmail = user.email.replace(/\./g, ',');
    const notificationsRef = ref(db, `userNotifications/${safeEmail}/notifications`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notifications = snapshot.val();
        // Check for any unread notifications
        const hasUnreadNotifications = Object.values(notifications).some(
          (notification) => !notification.read
        );
        setHasUnread(hasUnreadNotifications);
      } else {
        setHasUnread(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

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
        <Menu size={26} />
      </button>

      <Link to="/home">
        <h1 className="text-2xl font-bold text-violet-700">CampusCrush</h1>
      </Link>

      {user ? (
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <Link to="/notification" className="relative">
            <Bell size={24} className="text-violet-700 hover:text-violet-900" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </Link>

          {/* User Menu */}
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
