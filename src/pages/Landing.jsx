import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="w-4xl text-center h-130 p-8 bg-white rounded-3xl shadow-2xl">
        <h1 className="text-5xl font-bold text-blue-700 mb-4">
          Welcome to Campus Crush
        </h1>
        <div className="mt-20">
        <h2 className="text-3xl font-bold text-black pb-4">Find out: </h2>
        <p className="text-gray-700 text-xl pb-3  ">
          If someone has a crush on you!
        </p>
        <p className="text-gray-700 mb-8 text-xl">
        If your crush likes you back – secretly.
        </p>
        
        </div>

        <div className="mt-33">
        <button
          onClick={handleGetStarted}
          className="px-8 py-4 w-50 font-bold text-base bg-pink-400 text-white rounded-full hover:bg-pink-500 transition"
        >
          Get Started
        </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
