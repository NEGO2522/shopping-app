import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { ref, get, push, set } from "firebase/database";
import { FiSearch } from 'react-icons/fi';

function Home() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [sentCrushes, setSentCrushes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
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

  // Check if crush button should be shown
  const shouldShowCrushButton = (profile) => {
    if (!currentUserData || !profile) return false;
    return currentUserData.gender !== profile.gender;
  };

  const handleProfileClick = (profileId) => {
    navigate(`/profile/${profileId}`);
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
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8 relative" ref={searchRef}>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="relative flex items-center">
                <FiSearch className="absolute left-3 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Search Dropdown */}
              {showDropdown && searchQuery && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map((profile) => (
                      <div
                        key={profile.uid}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSearchQuery('');
                          setShowDropdown(false);
                          handleProfileClick(profile.uid);
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700 flex-shrink-0">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                          <p className="text-xs text-gray-500">{profile.branch}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.uid}
              id={`profile-${profile.uid}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div 
                className="bg-violet-600 px-4 py-3 cursor-pointer"
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

                {shouldShowCrushButton(profile) && (
                  <button
                    className={`mt-4 w-full px-4 py-2 rounded-md transition-colors duration-200 font-medium cursor-pointer ${
                      hasSentCrush(profile.uid)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed cursor-pointer'
                        : 'bg-violet-100 text-violet-700 hover:bg-violet-200 cursor-pointer'
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
