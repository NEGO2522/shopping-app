import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Users, ShieldCheck, MessageSquare } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Info className="text-violet-600 w-6 h-6 mr-3" />
            <h1 className="text-2xl font-bold text-violet-900">About Campus Crush</h1>
          </div>
          <div className="space-y-6">
            <p className="text-gray-600">
              Campus Crush is a safe and secure platform designed to help students at Poornima University find and connect with their crushes & share their thoughts anonymously. 
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* How it Works */}
              <div className="bg-white/80 rounded-xl shadow p-6">
                <div className="flex items-center mb-4">
                  <Users className="text-violet-600 w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold text-violet-900">Connect to your crush:</h2>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Create your profile with basic details</li>
                <li>Browse other students' profiles anonymously</li>
                <li>Send a crush request to someone you like</li>
                <li>Your crush will never know you sent a request.</li>
                <li>Wait to see if your crush likes you back</li>
                <li>Start chatting once it’s a mutual crush</li>
                </ol>
              </div>

              {/* Safety Features */}
              <div className="bg-white/80 rounded-xl shadow p-6">
                <div className="flex items-center mb-4">
                  <ShieldCheck className="text-green-600 w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold text-green-900">Safety & Privacy</h2>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Anonymous until both parties accept</li>
                  <li>No personal information shared initially</li>
                  <li>Verified Poornima University students only</li>
                  <li>Secure messaging system</li>
                </ul>
              </div>

              {/* Anonymous Talk */}
              <div className="bg-white/80 rounded-xl shadow p-6">
                <div className="flex items-center mb-4">
                  <MessageSquare className="text-teal-600 w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold text-teal-900">Anonymous Talk</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Share your thoughts freely with our Anonymous Talk feature! Every user gets a unique nickname for posting, ensuring complete privacy.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-teal-500">•</span>
                      <span className="text-gray-600">Share your thoughts anonymously</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-teal-500">•</span>
                      <span className="text-gray-600">Unique nickname for each post</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-teal-500">•</span>
                      <span className="text-gray-600">No personal information shared</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-teal-500">•</span>
                      <span className="text-gray-600">Safe space for honest conversations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white/80 rounded-xl shadow p-6">
                <div className="flex items-center mb-4">
                  <Info className="text-blue-600 w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold text-blue-900">FAQ</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-800">Is this safe?</h3>
                    <p className="text-gray-600">Yes, we prioritize safety with anonymous matching and verified student profiles.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-800">How do I send a crush?</h3>
                    <p className="text-gray-600">Browse profiles, find someone you like, and tap the crush button on their profile.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-800">What if someone rejects my crush?</h3>
                    <p className="text-gray-600">Stay positive! You can always find other matches. Your identity remains anonymous.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;