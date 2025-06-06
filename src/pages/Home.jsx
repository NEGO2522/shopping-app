import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { ref, get, push, set, onValue, remove } from "firebase/database";
import { FiSearch, FiMessageCircle, FiUser, FiMessageSquare } from 'react-icons/fi';
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
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'people'
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
    const profile = profiles.find(p => p.uid === profileId);
    if (profile) {
      navigate(`/profile/${profileId}`, {
        state: {
          profile: {
            ...profile,
            isMutualCrush: hasMutualCrush(profileId),
            hasSentCrush: hasSentCrush(profileId)
          }
        }
      });
    }
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
    <div className="min-h-screen bg-violet-50">
      {/* Main Content - Adjusted with top padding for fixed navbar */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div ref={searchRef} className="relative mb-6">
            <div className="flex items-center bg-white rounded-lg shadow-md">
              <div className="p-3 text-gray-400">
                <FiSearch className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder={activeTab === 'people' ? "Search people by name or branch..." : "Search posts..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                className="flex-1 p-3 rounded-r-lg text-sm focus:outline-none"
              />
            </div>
            {/* Dropdown results - only show for people tab */}
            {activeTab === 'people' && showDropdown && searchQuery && (
              <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
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
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700 overflow-hidden">
                          {profile.photoURL ? (
                            <img
                              src={profile.photoURL}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            profile.name.charAt(0).toUpperCase()
                          )}
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

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'posts'
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-500 hover:text-violet-700'
                }`}
              >
                <FiMessageSquare className="mr-2" />
                Posts
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'people'
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-500 hover:text-violet-700'
                }`}
              >
                <FiUser className="mr-2" />
                People
              </button>
            </div>
          </div>

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
                  <div className="text-4xl mb-4">💘</div>
                  <h3 className="text-2xl font-bold text-violet-900 mb-2">It's a Match!</h3>
                  <p className="text-gray-600">
                    You and {matchedProfile.name} have a mutual crush! Start chatting now!
                  </p>
                  <button
                    onClick={() => {
                      setActiveChatId(matchedProfile.uid);
                      setShowCongrats(false);
                    }}
                    className="mt-6 bg-violet-600 text-white px-6 py-2 rounded-full hover:bg-violet-700 transition-colors duration-200"
                  >
                    Start Chat
                  </button>
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

          {activeTab === 'posts' ? (
            // Posts Section
            <div className="mb-8">
              <AnonymousThoughts />
            </div>
          ) : (
            // People Section
            <>
              {/* Mutual Crushes Section */}
              {!viewingSentCrushes && getMutualCrushes().length > 0 && (
                <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-violet-900 mb-6 flex items-center">
                    <span className="text-2xl mr-2">💘</span>
                    Your Mutual Crushes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {getMutualCrushes().map((profile) => (
                      <div
                        key={profile.uid}
                        className="bg-white rounded-xl shadow-lg flex flex-col min-h-[400px]"
                        onClick={() => handleProfileClick(profile.uid)}
                      >
                        <div className="">
                          <div className="flex items-center gap-3 mb-4 rounded-t-xl bg-violet-600 p-6">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-violet-700 overflow-hidden flex-shrink-0">
                              {profile.photoURL ? (
                                <img
                                  src={profile.photoURL}
                                  alt={profile.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                profile.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl text-white">{profile.name}</h3>
                              <p className="text-violet-100 text-lg">{profile.year}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4 bg-white p-6">
                            <div>
                              <p className="text-base font-medium text-gray-600">Branch</p>
                              <p className="text-lg text-black">{profile.branch}</p>
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-600">Bio</p>
                              <p className="text-lg text-black">{profile.bio}</p>
                            </div>
                          </div>

                          <div className="p-6 mt-auto">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveChatId(profile.uid);
                              }}
                              className="w-full px-6 py-3 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all duration-200 text-base font-medium flex items-center justify-center space-x-2"
                            >
                              <FiMessageCircle className="text-xl" />
                              <span>Start Chat</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-8">
                {(viewingSentCrushes ? getSentCrushProfiles() : profiles)
                  .filter(profile => !hasMutualCrush(profile.uid))
                  .map((profile) => (
                    <div
                      key={profile.uid}
                      className="bg-white rounded-xl shadow-lg flex flex-col min-h-[400px]"
                      onClick={() => handleProfileClick(profile.uid)}
                    >
                      <div className="">
                        <div className="flex items-center gap-3 mb-4 rounded-t-xl bg-violet-600 p-6">
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-violet-700 overflow-hidden flex-shrink-0">
                            {profile.photoURL ? (
                              <img
                                src={profile.photoURL}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              profile.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl text-white">{profile.name}</h3>
                            <p className="text-violet-100 text-lg">{profile.year}</p>
                          </div>
                        </div>

                        <div className="space-y-4 bg-white p-6">
                          <div>
                            <p className="text-base font-medium text-gray-600">Branch</p>
                            <p className="text-lg text-black">{profile.branch}</p>
                          </div>
                          <div>
                            <p className="text-base font-medium text-gray-600">Residence</p>
                            <p className="text-lg text-black">{profile.residence}</p>
                          </div>
                          <div>
                            <p className="text-base font-medium text-gray-600">Bio</p>
                            <p className="text-lg text-black">{profile.bio}</p>
                          </div>
                        </div>

                        <div className="p-6 mt-auto">
                          {shouldShowCrushButton(profile) && !hasSentCrush(profile.uid) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendCrush(profile);
                              }}
                              className="w-full px-6 py-3 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all duration-200 text-base font-medium flex items-center justify-center space-x-2"
                            >
                              <span>Send Crush</span>
                              <span className="text-xl">💘</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Empty States */}
              {viewingSentCrushes && getSentCrushProfiles().length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    You haven't sent any crushes yet. Start exploring profiles! 💝
                  </p>
                </div>
              )}
              {!viewingSentCrushes && profiles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No profiles available at the moment. Check back later! 🌟
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
