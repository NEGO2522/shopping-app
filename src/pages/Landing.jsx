import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home");
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-pink-50">
      <div className="max-w-xl text-center p-8 bg-white rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-bold text-pink-700 mb-4">
          💘 Welcome to CrushConnect
        </h1>
        <h2 className="text-xl text-purple-800 mb-4">
          Discover mutual feelings — Only at Poornima University
        </h2>
        <p className="text-gray-700 mb-8 text-base">
          Secretly like someone? Let’s find out if they feel the same — anonymously and securely.
        </p>

        <button
          onClick={handleGetStarted}
          className="px-8 py-4 text-base bg-pink-400 text-white rounded-full hover:bg-pink-500 transition"
        >
          💫 Get Started
        </button>

        <p className="mt-6 italic text-gray-400 text-sm">
          🔒 100% anonymous. Revealed only if both crush ❤️
        </p>
      </div>
    </div>
  );
}

export default Landing;
