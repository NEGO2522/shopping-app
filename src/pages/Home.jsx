import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { ref, get, push, set, onValue, remove } from "firebase/database";
import { FiSearch } from 'react-icons/fi';
import { FiMessageCircle } from 'react-icons/fi';
import Chat from '../components/Chat';
import AnonymousThoughts from '../components/AnonymousThoughts';

function Home() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [sentCrushes, setSentCrushes] = useState({});
  const [receivedCrushes, setReceivedCrushes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [viewingSentCrushes, setViewingSentCrushes] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchQuery.toLowerCase();
    return (
      profile.name.toLowerCase().includes(searchLower) ||
      profile.branch.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Fetch current user's data first
        const currentUserRef = ref(db, `users/${currentUser.uid}`);
        const currentUserSnapshot = await get(currentUserRef);
        if (currentUserSnapshot.exists()) {
          setCurrentUserData(currentUserSnapshot.val());
        }

        // Fetch sent crushes
        const sentCrushesRef = ref(db, `sentCrushes/${currentUser.uid}`);
        const sentCrushesSnapshot = await get(sentCrushesRef);
        if (sentCrushesSnapshot.exists()) {
          setSentCrushes(sentCrushesSnapshot.val());
        }

        // Fetch received crushes
        const receivedCrushesRef = ref(db, `sentCrushes`);
        const receivedCrushesSnapshot = await get(receivedCrushesRef);
        if (receivedCrushesSnapshot.exists()) {
          const allCrushes = receivedCrushesSnapshot.val();
          const received = {};
          
          // Find crushes where current user is the target
          Object.entries(allCrushes).forEach(([senderId, crushes]) => {
            Object.entries(crushes).forEach(([targetId, crushData]) => {
              if (targetId === currentUser.uid) {
                received[senderId] = crushData;
              }
            });
          });
          
          setReceivedCrushes(received);
        }

        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          // Filter out the current user and convert to array
          const profilesArray = Object.values(usersData).filter(
            user => user.uid !== currentUser.uid
          );
          setProfiles(profilesArray);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError("Failed to load profiles");
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [navigate]);

  // Add listener for mutual crush notifications
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const mutualCrushNotificationsRef = ref(db, `mutualCrushNotifications/${currentUser.uid}`);
    
    const unsubscribe = onValue(mutualCrushNotificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notification = snapshot.val();
        setMatchedProfile(notification.profile);
        setShowCongrats(true);
        // Remove the notification after showing it
        remove(mutualCrushNotificationsRef);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSendCrush = async (profile) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUserData) {
        navigate('/login');
        return;
      }

      // Create notification in the database
      const safeEmail = profile.email.replace(/\./g, ',');
      const notificationRef = ref(db, `userNotifications/${safeEmail}/notifications`);
      const newNotification = {
        message: "Somebody has a crush on you! 💘",
        timestamp: Date.now(),
        fromUserId: currentUser.uid,
        fromUserEmail: currentUserData.email,
        fromUserName: currentUserData.name,
        toUserEmail: profile.email,
        toUserId: profile.uid,
        toUserName: profile.name,
        read: false
      };

      // Push the notification
      await push(notificationRef, newNotification);

      // Record that this user has sent a crush
      const sentCrushRef = ref(db, `sentCrushes/${currentUser.uid}/${profile.uid}`);
      await set(sentCrushRef, {
        timestamp: Date.now(),
        targetUserId: profile.uid,
        targetUserEmail: profile.email,
        targetUserName: profile.name
      });

      // Check if this creates a mutual crush
      const theirCrushRef = ref(db, `sentCrushes/${profile.uid}/${currentUser.uid}`);
      const theirCrushSnapshot = await get(theirCrushRef);
      
      if (theirCrushSnapshot.exists()) {
        // It's a mutual crush! Create notifications for both users
        const mutualNotification = {
          type: "mutual_crush",
          message: "🎉 You have a mutual crush! Time to connect! 💘",
          timestamp: Date.now(),
          read: false
        };

        // Create mutual crush notification for current user
        const currentUserNotificationRef = ref(db, `mutualCrushNotifications/${currentUser.uid}`);
        await set(currentUserNotificationRef, {
          ...mutualNotification,
          profile: {
            uid: profile.uid,
            name: profile.name,
            email: profile.email,
            branch: profile.branch,
            residence: profile.residence,
            bio: profile.bio
          }
        });

        // Create mutual crush notification for other user
        const otherUserNotificationRef = ref(db, `mutualCrushNotifications/${profile.uid}`);
        await set(otherUserNotificationRef, {
          ...mutualNotification,
          profile: {
            uid: currentUser.uid,
            name: currentUserData.name,
            email: currentUserData.email,
            branch: currentUserData.branch,
            residence: currentUserData.residence,
            bio: currentUserData.bio
          }
        });

        // Update local state for immediate UI update
        setMatchedProfile(profile);
        setShowCongrats(true);

        // Update received crushes for immediate UI update
        setReceivedCrushes(prev => ({
          ...prev,
          [profile.uid]: {
            timestamp: Date.now(),
            targetUserId: currentUser.uid,
            targetUserEmail: currentUserData.email,
            targetUserName: currentUserData.name
          }
        }));

        // Send regular notifications as well
        const currentUserSafeEmail = currentUserData.email.replace(/\./g, ',');
        await push(ref(db, `userNotifications/${currentUserSafeEmail}/notifications`), {
          ...mutualNotification,
          withUserName: profile.name,
          withUserId: profile.uid,
          withUserEmail: profile.email
        });

        await push(ref(db, `userNotifications/${safeEmail}/notifications`), {
          ...mutualNotification,
          withUserName: currentUserData.name,
          withUserId: currentUser.uid,
          withUserEmail: currentUserData.email
        });
      }

      // Update local state
      setSentCrushes(prev => ({
        ...prev,
        [profile.uid]: {
          timestamp: Date.now(),
          targetUserId: profile.uid,
          targetUserEmail: profile.email,
          targetUserName: profile.name
        }
      }));

      // Show success message
      alert("Crush sent successfully! 💌");
    } catch (err) {
      console.error("Error sending crush:", err);
      alert("Failed to send crush. Please try again.");
    }
  };

  const hasSentCrush = (profileId) => {
    return sentCrushes[profileId] !== undefined;
  };

  const hasMutualCrush = (profileId) => {
    // Check if current user has sent a crush to this profile
    const hasSentCrush = sentCrushes[profileId] !== undefined;
    
    // Check if this profile has sent a crush to current user
    const hasReceivedCrush = receivedCrushes[profileId] !== undefined;
    
    return hasSentCrush && hasReceivedCrush;
  };

  // Check if crush button should be shown
  const shouldShowCrushButton = (profile) => {
    if (!currentUserData || !profile) return false;
    return currentUserData.gender !== profile.gender;
  };

  const handleProfileClick = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  // Get mutual crushes
  const getMutualCrushes = () => {
    return profiles.filter(profile => hasMutualCrush(profile.uid));
  };

  // Get sent crush profiles
  const getSentCrushProfiles = () => {
    return profiles.filter(profile => hasSentCrush(profile.uid));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-violet-50">
        <div className="text-xl text-violet-700">Loading profiles...</div>
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
      {/* Congratulations Overlay */}
      {showCongrats && matchedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative animate-bounce-once">
            <button
              onClick={() => setShowCongrats(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="text-6xl mb-4">💘</div>
              <h2 className="text-2xl font-bold text-violet-900 mb-4">
                Congratulations! It's a Match!
              </h2>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-bold text-violet-700">
                  {currentUserData?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-3xl">💕</div>
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-bold text-violet-700">
                  {matchedProfile.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                You and {matchedProfile.name} have a mutual crush! Time to start a conversation!
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActiveChatId(matchedProfile.uid);
                    setShowCongrats(false);
                  }}
                  className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <FiMessageCircle className="text-xl" />
                  <span>Start Chatting</span>
                </button>
                <button
                  onClick={() => setShowCongrats(false)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        {/* Search Bar */}
        <div ref={searchRef} className="relative mb-6">
          <div className="flex items-center bg-white rounded-lg shadow-md">
            <div className="p-3 text-gray-400">
              <FiSearch className="w-6 h-6" />
            </div>
            <input
              type="text"
              placeholder="Search by name or branch..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              className="flex-1 p-3 rounded-r-lg focus:outline-none"
            />
          </div>
          {/* Dropdown results */}
          {showDropdown && searchQuery && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                  <div
                    key={profile.uid}
                    className="p-3 hover:bg-violet-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      handleProfileClick(profile.uid);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{profile.name}</p>
                        <p className="text-sm text-gray-500">{profile.branch}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No profiles found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mutual Crushes Section - Pinned at top */}
        {!viewingSentCrushes && getMutualCrushes().length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-violet-900 mb-14 text-left flex items-center justify-center">
              Your Mutual Crush
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {getMutualCrushes().map((profile) => (
                <div
                  key={profile.uid}
                  id={`profile-${profile.uid}`}
                  className="bg-white rounded-lg border border-pink-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                  onClick={() => handleProfileClick(profile.uid)}
                >
                  <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-white">
                        <h3 className="font-semibold text-sm">{profile.name}</h3>
                        <p className="text-xs text-pink-100">{profile.branch}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 text-center bg-pink-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChatId(profile.uid);
                      }}
                      className="w-full flex items-center justify-center space-x-1 px-2 py-1 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors duration-200 text-sm"
                    >
                      <FiMessageCircle className="text-sm" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anonymous Thoughts Section */}
        <div className="mb-8">
          <AnonymousThoughts />
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
            <button
              onClick={() => setViewingSentCrushes(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                !viewingSentCrushes
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:text-violet-700'
              }`}
            >
              All Profiles
            </button>
            <button
              onClick={() => setViewingSentCrushes(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewingSentCrushes
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:text-violet-700'
              }`}
            >
              My Crushes ({getSentCrushProfiles().length})
            </button>
          </div>
        </div>

        {/* Main Profile Grid */}
        {viewingSentCrushes ? (
          <>
            <h2 className="text-2xl font-bold text-violet-900 mb-6 text-center flex items-center justify-center">
              <span className="text-3xl mr-2">💌</span>
              My Sent Crushes
              <span className="text-3xl ml-2">💌</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getSentCrushProfiles().map((profile) => (
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

                    {shouldShowCrushButton(profile) && !hasMutualCrush(profile.uid) && (
                      <button
                        className={`mt-4 w-full px-4 py-2 rounded-md transition-colors duration-200 font-medium ${
                          hasSentCrush(profile.uid)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendCrush(profile);
                        }}
                        disabled={hasSentCrush(profile.uid)}
                      >
                        {hasSentCrush(profile.uid) ? '💝 Crush Sent' : '💌 Send Crush'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {getSentCrushProfiles().length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  You haven't sent any crushes yet. Start exploring profiles! 💝
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-violet-900 mb-6 text-center flex items-center justify-center">
              Recommendations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {profiles
                .filter(profile => !hasMutualCrush(profile.uid))
                .map((profile) => (
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

                      {shouldShowCrushButton(profile) && !hasMutualCrush(profile.uid) && (
                        <button
                          className={`mt-4 w-full px-4 py-2 rounded-md transition-colors duration-200 font-medium ${
                            hasSentCrush(profile.uid)
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendCrush(profile);
                          }}
                          disabled={hasSentCrush(profile.uid)}
                        >
                          {hasSentCrush(profile.uid) ? '💝 Crush Sent' : '💌 Send Crush'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* No Profiles Message */}
        {profiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No profiles available at the moment. Check back later! 🌟
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
