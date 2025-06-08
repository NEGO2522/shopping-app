import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-violet-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-pink-500/10 pointer-events-none" />
        <div className="container mx-auto px-2 sm:px-4 pt-10 sm:pt-20 pb-6 sm:pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 mb-4 sm:mb-8">
              Campus Crush
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-12 leading-relaxed">
              Find out who likes you & share your campus stories anonymously.
            </p>
          </div>
        </div>
      </div>


       {/* Campus Community Card */}
       <div className="py-8 sm:py-16">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl sm:rounded-3xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
              <div className="bg-gradient-to-r from-violet-600 to-pink-500 px-4 sm:px-8 py-4 sm:py-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">Campus Talks</h2>
              </div>
              <div className="p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                  <div>
                    <h4 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-6">Campus Voices</h4>
                    <ul className="space-y-3 sm:space-y-4">
                      <li className="flex items-center text-gray-700 text-base sm:text-lg">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </span>
                        Talk about anything on campus - food, hostel, classes, events
                      </li>
                      <li className="flex items-center text-gray-700 text-base sm:text-lg">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </span>
                        See others' thoughts – Know what people are feeling
                      </li>
                      <li className="flex items-center text-gray-700 text-base sm:text-lg">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </span>
                        Reply & connect – Join talks without showing your name
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-8">
                    <h4 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-6">Why You'll Love It</h4>
                    <ul className="space-y-4 sm:space-y-6">
                      <li className="flex items-start">
                        <span className="text-2xl sm:text-3xl mr-2 sm:mr-4">🧑‍🎓</span>
                        <span className="text-gray-700 text-base sm:text-lg"> Only for students in our campus</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl sm:text-3xl mr-2 sm:mr-4">🔒</span>
                        <span className="text-gray-700 text-base sm:text-lg"> 100% anonymous — always</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl sm:text-3xl mr-2 sm:mr-4">💡</span>
                        <span className="text-gray-700 text-base sm:text-lg">Be real, be honest, be heard</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl sm:text-3xl mr-2 sm:mr-4">🤝</span>
                        <span className="text-gray-700 text-base sm:text-lg">Campus talks that matter.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* How It Works */}
      <div className="py-8 sm:py-16">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12">
            <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-4xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <span className="text-base sm:text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1 sm:mb-4">Join</h3>
              <p className="text-gray-600 text-sm sm:text-lg">
                Sign up with your College email for Verification.
              </p>
            </div>
            <div className="bg-white p-3 sm:p-8 rounded-2xl sm:rounded-4xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <span className="text-base sm:text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1 sm:mb-4">Like Someone</h3>
              <p className="text-gray-600 text-sm sm:text-lg">
                Tell us who you like - they won't know it's you
              </p>
            </div>
            <div className="bg-white p-3 sm:p-8 rounded-2xl sm:rounded-4xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <span className="text-base sm:text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1 sm:mb-4">Match</h3>
              <p className="text-gray-600 text-sm sm:text-lg">
                If they like you too, start chatting!
              </p>
            </div>
          </div>
        </div>
      </div>

     

      {/* Final CTA */}
      <div className="py-10 sm:py-20">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleGetStarted}
              className="px-6 sm:px-12 py-3 sm:py-6 text-base sm:text-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-pink-500 rounded-full 
                hover:from-violet-700 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-xl
                hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;