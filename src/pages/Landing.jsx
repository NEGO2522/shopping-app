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
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 mb-8">
              Campus Crush
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-12 leading-relaxed">
              Like someone on campus? Find out if they like you too! Share your feelings safely and privately.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent mb-3">1000+</div>
              <p className="text-gray-600 text-lg">Students Using Campus Crush</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent mb-3">500+</div>
              <p className="text-gray-600 text-lg">Successful Matches</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent mb-3">100%</div>
              <p className="text-gray-600 text-lg">Safe & Private</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Community Card */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
              <div className="bg-gradient-to-r from-violet-600 to-pink-500 px-8 py-6">
                <h2 className="text-3xl font-bold text-white text-center">Made for Poornima University Students</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Your Campus Dating App</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      Like someone? Tell them secretly! We'll only let them know if they like you back.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center text-gray-700 text-lg">
                        <span className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </span>
                        Sign up with student email
                      </li>
                      <li className="flex items-center text-gray-700 text-lg">
                        <span className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </span>
                        Only for our campus
                      </li>
                      <li className="flex items-center text-gray-700 text-lg">
                        <span className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </span>
                        Your secrets stay safe
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-8">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-6">Why You'll Love It</h4>
                    <ul className="space-y-6">
                      <li className="flex items-start">
                        <span className="text-3xl mr-4">💫</span>
                        <span className="text-gray-700 text-lg">Tell someone you like them secretly</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-3xl mr-4">🔒</span>
                        <span className="text-gray-700 text-lg">No one knows unless they like you back</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-3xl mr-4">💝</span>
                        <span className="text-gray-700 text-lg">Find out who likes you</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-3xl mr-4">✨</span>
                        <span className="text-gray-700 text-lg">Chat only when you both like each other</span>
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
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Join</h3>
              <p className="text-gray-600 text-lg">
                Sign up with your College email for Verification.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Like Someone</h3>
              <p className="text-gray-600 text-lg">
                Tell us who you like - they won't know it's you
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Match</h3>
              <p className="text-gray-600 text-lg">
                If they like you too, start chatting!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">Got a Crush?</h2>
            <p className="text-xl text-gray-600 mb-12">
              Tell them secretly and see what happens!
            </p>
            <button
              onClick={handleGetStarted}
              className="px-12 py-6 text-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-pink-500 rounded-full 
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
