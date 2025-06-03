import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Adjust the import based on your firebase config
function Home() {
  const navigate = useNavigate();



  return (
    <div className="h-full overflow-hidden bg-violet-50 relative">

      {/* Remove this Navbar, it's already in App.js */}
      {/* <div className="w-full h-18">
        <Navbar toggleSidebar={toggleSidebar} />
      </div> */}

      <div className="h-[calc(100vh-4.5rem)] flex items-center justify-center px-6">
        <div className="max-w-xl bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl text-violet-700 font-semibold mb-4">
            💖 Welcome to Crush Finder!
          </h1>
          <p className="text-gray-600 mb-6">
            Secretly like someone at Poornima University? Tap “Send Crush” — and if they like you
            back, it’s a match made in PU! 💫
          </p>

          <div className="bg-gray-100 text-gray-700 p-4 rounded-lg">
            💡 Tip: No one sees your crush unless it’s mutual. 100% private and fun!
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
