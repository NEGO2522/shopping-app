import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { ref, get } from "firebase/database";
import { FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import Chat from '../components/Chat';

function MyCrushes() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [sentCrushes, setSentCrushes] = useState({});
  const [receivedCrushes, setReceivedCrushes] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);

  const hasMutualCrush = (profileId) => {
    // Check if current user has sent a crush to this profile
    const hasSentCrush = sentCrushes[profileId] !== undefined;
    
    // Check if this profile has sent a crush to current user
    const hasReceivedCrush = receivedCrushes[profileId] !== undefined;
    
    return hasSentCrush && hasReceivedCrush;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Fetch current user's data
        const currentUserRef = ref(db, `users/${currentUser.uid}`);
        const currentUserSnapshot = await get(currentUserRef);
        if (currentUserSnapshot.exists()) {
          setCurrentUserData(currentUserSnapshot.val());
        }

        // Fetch sent crushes
        const sentCrushesRef = ref(db, `sentCrushes/${currentUser.uid}`);
        const sentCrushesSnapshot = await get(sentCrushesRef);
        const sentCrushesData = sentCrushesSnapshot.exists() ? sentCrushesSnapshot.val() : {};
        setSentCrushes(sentCrushesData);

        // Fetch received crushes - check who has sent crushes to current user
        const allCrushesRef = ref(db, 'sentCrushes');
        const allCrushesSnapshot = await get(allCrushesRef);
        if (allCrushesSnapshot.exists()) {
          const allCrushes = allCrushesSnapshot.val();
          const received = {};
          
          // Look through all users' sent crushes
          Object.entries(allCrushes).forEach(([senderId, crushes]) => {
            // If someone has sent a crush to current user
            if (crushes[currentUser.uid]) {
              received[senderId] = crushes[currentUser.uid];
            }
          });
          
          setReceivedCrushes(received);
        }

        // Fetch all users to get profile data for crushes
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val();
          // Filter only the profiles where user has sent crushes
          const sentCrushIds = Object.keys(sentCrushesData);
          const crushProfiles = Object.values(usersData).filter(
            user => sentCrushIds.includes(user.uid)
          );
          setProfiles(crushProfiles);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load crushes");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleProfileClick = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-violet-50">
        <div className="text-xl text-violet-700">Loading your crushes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-violet-50">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-violet-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Full Screen Chat Overlay */}
      {activeChatId && (
        <div className="fixed inset-0 bg-violet-50 z-50">
          <div className="max-w-4xl mx-auto h-screen py-4 px-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveChatId(null)}
                  className="p-2 hover:bg-violet-100 rounded-full transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-violet-900">
                  Chat with {profiles.find(p => p.uid === activeChatId)?.name}
                </h2>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
              <Chat 
                recipientId={activeChatId} 
                recipientName={profiles.find(p => p.uid === activeChatId)?.name} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-violet-900 mb-8 text-center flex items-center justify-center">
          My Crushes
        </h1>

        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.uid}
                id={`profile-${profile.uid}`}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                  hasMutualCrush(profile.uid) ? 'ring-2 ring-pink-400 ring-offset-4 ring-offset-violet-50' : ''
                }`}
              >
                <div 
                  className={`${
                    hasMutualCrush(profile.uid) ? 'bg-gradient-to-r from-pink-500 to-violet-500' : 'bg-violet-600'
                  } px-4 py-3 cursor-pointer relative`}
                  onClick={() => handleProfileClick(profile.uid)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-xl font-bold text-violet-700">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold">{profile.name}</h3>
                      <p className="text-sm text-violet-200">{profile.year}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {hasMutualCrush(profile.uid) && (
                    <div className="mb-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl">💘</span>
                        <p className="text-pink-700 font-medium text-center">
                          It's a match! You and {profile.name} have a crush on each other!
                        </p>
                        <span className="text-2xl">💘</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Branch</span>
                      <p className="text-gray-800">{profile.branch}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Residence</span>
                      <p className="text-gray-800">{profile.residence}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Bio</span>
                      <p className="text-gray-800">{profile.bio}</p>
                    </div>
                  </div>

                  {hasMutualCrush(profile.uid) && (
                    <div className="mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChatId(profile.uid);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
                      >
                        <FiMessageCircle className="text-xl" />
                        <span>Open Chat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">💝</div>
            <h3 className="text-xl font-semibold text-violet-900 mb-2">No Crushes Yet</h3>
            <p className="text-gray-600">
              You haven't sent any crushes yet. Start exploring profiles and connect with people!
            </p>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200"
            >
              Explore Profiles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCrushes; 