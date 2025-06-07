import React, { Fragment, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  ref,
  get,
  push,
  set,
  onValue,
  remove
} from "firebase/database";
import {
  FiSearch,
  FiMessageCircle,
  FiUser,
  FiMessageSquare,
  FiHeart,
  FiX
} from "react-icons/fi"; // Added FiX for the close button in the match modal
import Chat from "../components/Chat";
import AnonymousThoughts from "../components/AnonymousThoughts";

/**
 * Home.jsx – streamlined UI
 * --------------------------------------------------
 * ‣ Minimal profile cards (avatar • name • branch)
 * ‣ Re‑usable helpers (SectionHeading, CardGrid, Empty, ProfileCard)
 * --------------------------------------------------
 */
function Home() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [sentCrushes, setSentCrushes] = useState({});
  const [receivedCrushes, setReceivedCrushes] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'people' | 'matches' -> ADDED 'matches'
  const [viewingSentCrushes, setViewingSentCrushes] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  // const [showMutualCrushes, setShowMutualCrushes] = useState(true); // This state can be removed if 'matches' tab is the primary way to view them

  const searchRef = useRef(null);

  /* --------------------------------------------------
   * Close dropdown on outside click
   * -------------------------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* --------------------------------------------------
   * Fetch profiles + crush meta from Firebase Realtime DB
   * -------------------------------------------------- */
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return navigate("/login");

        // me
        const meSnap = await get(ref(db, `users/${currentUser.uid}`));
        if (meSnap.exists()) {
          setCurrentUserData(meSnap.val());
        } else {
          // Handle case where current user data doesn't exist (e.g., incomplete registration)
          console.warn("Current user data not found in DB.");
        }

        // sent
        const sentSnap = await get(ref(db, `sentCrushes/${currentUser.uid}`));
        if (sentSnap.exists()) {
          setSentCrushes(sentSnap.val());
        } else {
          setSentCrushes({}); // Ensure it's an empty object if no crushes sent
        }

        // received → where I'm target
        const allSnap = await get(ref(db, "sentCrushes"));
        if (allSnap.exists()) {
          const rec = {};
          Object.entries(allSnap.val()).forEach(([sender, list]) => {
            // Check if 'list' is an object before iterating
            if (typeof list === 'object' && list !== null) {
              Object.keys(list).forEach((tgt) => {
                if (tgt === currentUser.uid) rec[sender] = list[tgt];
              });
            }
          });
          setReceivedCrushes(rec);
        } else {
          setReceivedCrushes({}); // Ensure it's an empty object if no crushes received
        }

        // users except me
        const usersSnap = await get(ref(db, "users"));
        if (usersSnap.exists()) {
          const others = Object.values(usersSnap.val()).filter(
            (u) => u.uid !== currentUser.uid
          );
          setProfiles(others);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load profiles. Please try again.");
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [navigate]);

  /* --------------------------------------------------
   * Live mutual‑crush listener
   * -------------------------------------------------- */
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const notifRef = ref(db, `mutualCrushNotifications/${currentUser.uid}`);
    const unsub = onValue(notifRef, (snap) => {
      if (snap.exists()) {
        const notificationData = snap.val();
        if (notificationData && notificationData.profile) {
          setMatchedProfile(notificationData.profile);
          setShowCongrats(true);
          // Remove the notification after it's displayed
          remove(notifRef)
            .catch(e => console.error("Error removing notification:", e));
        }
      }
    });
    return () => unsub();
  }, []);

  /* ---------- helpers ---------- */
  // This now filters profiles based on search query and opposite gender, regardless of active tab
  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    const isOppositeGender = currentUserData?.gender !== p.gender;
    return (
      (p.name.toLowerCase().includes(q) || p.branch.toLowerCase().includes(q)) && // Search by name OR branch
      isOppositeGender
    );
  });

  const hasSentCrush = (profileId) => {
    return !!sentCrushes[profileId];
  };

  const hasMutualCrush = (profileId) => {
    return hasSentCrush(profileId) && !!receivedCrushes[profileId];
  };

  const getMutualCrushes = () => {
    return profiles.filter(profile => hasMutualCrush(profile.uid));
  };

  const getSentCrushProfiles = () => {
    return profiles.filter(profile => hasSentCrush(profile.uid));
  };

  // Profiles that the current user can send a crush to (opposite gender and not already sent)
  const crushableProfiles = profiles.filter(p =>
    currentUserData?.gender !== p.gender && !hasSentCrush(p.uid)
  );

  /* ---------- actions ---------- */
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
            bio: profile.bio,
            photoURL: profile.photoURL
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
            bio: currentUserData.bio,
            photoURL: currentUserData.photoURL
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

  if (loading) {
    return <Centered>Loading profiles…</Centered>;
  }

  if (error) {
    return <Centered error>{error}</Centered>;
  }

  return (
    <div className="min-h-screen bg-violet-50">
      {/* Main Content - Adjusted with top padding for fixed navbar */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div ref={searchRef} className="relative mb-6">
            <div className="flex items-center bg-white rounded-lg shadow-md">
              <span className="p-3 text-gray-400">
                <FiSearch className="w-5 h-5" />
              </span>
              <input
                className="flex-1 p-3 rounded-r-lg text-sm focus:outline-none"
                type="text"
                placeholder="Search people by name or branch..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
              />
            </div>

            {showDropdown && searchQuery && (
              <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                {filteredProfiles.length ? (
                  filteredProfiles.map((p) => (
                    <button
                      key={p.uid}
                      onClick={() => {
                        handleProfileClick(p.uid);
                        setShowDropdown(false);
                        setSearchQuery(''); // Clear search after selection
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-violet-50 flex items-center space-x-3 border-b last:border-none"
                    >
                      <Avatar url={p.photoURL} name={p.name} size="8" />
                      <div> {/* Added a div to stack name and branch */}
                        <span className="font-medium text-sm">{p.name}</span>
                        {p.branch && ( // Conditionally render branch if it exists
                          <p className="text-gray-500 text-xs">{p.branch}</p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-center text-gray-500 text-sm">No profiles found</p>
                )}
              </div>
            )}
          </div>

          {/* Tabs - MODIFIED */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-1 inline-flex items-center">
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
              {/* New "Matches" Tab Button - ADDED */}
              {getMutualCrushes().length > 0 && (
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'matches'
                      ? 'bg-pink-100 text-pink-700' // Distinct styling for matches
                      : 'text-gray-500 hover:text-pink-700'
                  }`}
                >
                  <FiHeart className="mr-2" />
                  Matches ({getMutualCrushes().length})
                </button>
              )}
            </div>
          </div>

          {/* Conditional Rendering based on activeTab */}
          {activeTab === "posts" && (
            <AnonymousThoughts />
          )}

          {activeTab === "people" && (
            <Fragment>
              <SectionHeading
                title="Peoples:"
                icon={<FiHeart />}
                actionLabel={viewingSentCrushes ? "View All People" : "View My Sent Crushes"}
                onAction={() => setViewingSentCrushes(!viewingSentCrushes)}
              />
              <CardGrid>
                {(viewingSentCrushes ? getSentCrushProfiles() : crushableProfiles).length > 0 ? (
                  (viewingSentCrushes ? getSentCrushProfiles() : crushableProfiles).map((p) => (
                    <ProfileCard
                      key={p.uid}
                      p={p}
                      onOpen={() => handleProfileClick(p.uid)}
                      onAction={() => handleSendCrush(p)}
                      actionLabel={viewingSentCrushes ? undefined : (hasSentCrush(p.uid) ? undefined : "Crush")}
                      isCrushSent={hasSentCrush(p.uid)}
                    />
                  ))
                ) : (
                  <Empty
                    msg={
                      viewingSentCrushes
                        ? "You haven't sent any crushes yet."
                        : "No new people found for you to crush on. Try expanding your search or check back later!"
                    }
                  />
                )}
              </CardGrid>
            </Fragment>
          )}

          {/* New "Matches" Page/Section - ADDED */}
          {activeTab === "matches" && (
            <div className="mb-8">
              <div className="bg-white rounded-b-2xl shadow-lg p-6">
                {getMutualCrushes().length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getMutualCrushes().map((profile) => (
                      <div
                        key={profile.uid}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ring-2 ring-pink-400 ring-offset-4 ring-offset-white"
                      >
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-3 cursor-pointer relative"
                          onClick={() => handleProfileClick(profile.uid)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-xl font-bold text-violet-700 overflow-hidden">
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
                            <div className="text-white">
                              <h3 className="font-semibold">{profile.name}</h3>
                              <p className="text-sm text-violet-200">{profile.year}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 cursor-pointer" onClick={() => handleProfileClick(profile.uid)}>
                          <div className="mb-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-2xl">💘</span>
                              <p className="text-pink-700 font-medium text-center">
                                It's a match! You and {profile.name} have a crush on each other!
                              </p>
                              <span className="text-2xl">💘</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Branch</span>
                              <p className="text-gray-800">{profile.branch}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Residence</span>
                              <p className="text-gray-800">{profile.residence}</p>
                            </div>
                            {profile.bio && (
                              <div>
                                <span className="text-sm font-medium text-gray-500">Bio</span>
                                <p className="text-gray-800 line-clamp-2">{profile.bio}</p>
                              </div>
                            )}
                          </div>

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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💝</div>
                    <h3 className="text-xl font-semibold text-violet-900 mb-2">No Matches Yet</h3>
                    <p className="text-gray-600">
                      Keep sending crushes to find your perfect match!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* full‑screen chat overlay */}
      {activeChatId && (
        <ChatOverlay
          name={profiles.find((x) => x.uid === activeChatId)?.name}
          onClose={() => setActiveChatId(null)}
        >
          <Chat
            recipientId={activeChatId}
            recipientName={profiles.find((x) => x.uid === activeChatId)?.name}
          />
        </ChatOverlay>
      )}

      {/* match modal */}
      {showCongrats && matchedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowCongrats(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center overflow-hidden">
                {matchedProfile.photoURL ? (
                  <img
                    src={matchedProfile.photoURL}
                    alt={matchedProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-violet-600">
                    {matchedProfile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-4xl mb-4">💘</div>
              <h3 className="text-2xl font-bold text-violet-900 mb-2">It's a Match!</h3>
              <p className="text-gray-600 mb-6">
                You and {matchedProfile.name} have a mutual crush! Start chatting now!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => {
                    navigate(`/profile/${matchedProfile.uid}`);
                    setShowCongrats(false);
                  }}
                  className="px-6 py-3 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors duration-200 w-full sm:w-auto"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setActiveChatId(matchedProfile.uid);
                    setShowCongrats(false);
                  }}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 w-full sm:w-auto"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Smaller components ---------- */
const Centered = ({ children, error }) => (
  <div className={`h-screen flex items-center justify-center ${error ? "bg-red-50" : "bg-gray-50"}`}>
    <p className={`text-xl ${error ? "text-red-600" : "text-gray-800"}`}>{children}</p>
  </div>
);

// Removed the old Tabs component as it's now integrated directly into Home for flexibility.
// You can keep it if you still use it elsewhere or prefer it as a separate component.

const SearchBar = ({
  searchRef,
  query,
  setQuery,
  showDropdown,
  setShowDropdown,
  list,
  onSelect
}) => (
  <div ref={searchRef} className="relative mb-6 max-w-lg mx-auto">
    <div className="flex items-center bg-white rounded-lg shadow-md">
      <span className="p-3 text-gray-400">
        <FiSearch className="w-5 h-5" />
      </span>
      <input
        className="flex-1 p-3 rounded-r-lg text-sm focus:outline-none"
        type="text"
        placeholder="Search people by name or branch..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
      />
    </div>

    {showDropdown && query && (
      <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
        {list.length ? (
          list.map((p) => (
            <button
              key={p.uid}
              onClick={() => onSelect(p.uid)}
              className="w-full text-left px-4 py-2 hover:bg-violet-50 flex items-center space-x-3 border-b last:border-none"
            >
              <Avatar url={p.photoURL} name={p.name} size="8" />
              <div> {/* Added a div to stack name and branch */}
                <span className="font-medium text-sm">{p.name}</span>
                {p.branch && ( // Conditionally render branch if it exists
                  <p className="text-gray-500 text-xs">{p.branch}</p>
                )}
              </div>
            </button>
          ))
        ) : (
          <p className="p-4 text-center text-gray-500 text-sm">No profiles found</p>
        )}
      </div>
    )}
  </div>
);

const CardGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
    {children}
  </div>
);

const ProfileCard = ({ p, actionLabel, onAction, onOpen, isCrushSent, isMutual }) => (
  <div
    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
    onClick={onOpen}
  >
    <div className="flex p-6">
      <div className="w-12 h-12 rounded-full bg-white border-2 border-white shadow-md mr-4">
        <Avatar url={p.photoURL} name={p.name} size="12" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-violet-900">{p.name}</h3>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <span>{p.branch}</span>
              <span className="text-gray-400">•</span>
              <span>{p.year}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {p.gender === 'male' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">♂</span>
            )}
            {p.gender === 'female' && (
              <span className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full">♀</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">{p.bio || 'No bio available'}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {isMutual && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center space-x-1">
                <span className="text-green-600">🎉</span>
                <span>Mutual Crush!</span>
              </span>
            )}
            {!isMutual && isCrushSent && (
              <span className="px-3 py-1 bg-violet-200 text-violet-800 text-sm rounded-full flex items-center space-x-1">
                <span className="text-violet-600">✓</span>
                <span>Crush sent</span>
              </span>
            )}
          </div>
          {actionLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click event from firing
                onAction();
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                actionLabel === 'Crush'
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : actionLabel === 'Chat'
                  ? 'bg-green-600 text-white hover:bg-green-700' // Styling for chat button
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Avatar = ({ url, name, size = "10" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false); // Stop loading animation on error
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`w-${size} h-${size} rounded-full bg-violet-100 flex items-center justify-center overflow-hidden shrink-0 relative`}>
      {isLoading && url && !hasError && ( // Only show spinner if URL exists and no error yet
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"></div>
        </div>
      )}

      {url && !hasError ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-gradient-to-r from-violet-100 to-violet-200 rounded-full">
          <span className="text-violet-700 font-bold text-lg">
            {name ? name.charAt(0).toUpperCase() : 'N/A'}
          </span>
        </div>
      )}
    </div>
  );
};

const SectionHeading = ({ title, icon, actionLabel, onAction }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-violet-900 flex items-center">
      {icon && <span className="text-2xl mr-2">{icon}</span>}
      {title}
    </h2>
    {actionLabel && (
      <button
        className="text-sm text-violet-700 hover:text-violet-900"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const Empty = ({ msg }) => (
  <div className="text-center py-12 col-span-full"> {/* col-span-full to center in grid */}
    <p className="text-gray-600 text-base">{msg}</p>
  </div>
);

const ChatOverlay = ({ name, onClose, children }) => (
  <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
    <div className="bg-white w-full max-w-3xl h-[60vh] mx-4 rounded-lg shadow-xl flex flex-col">
      <header className="flex items-center p-4 border-b bg-white rounded-t-lg">
        <button
          className="p-2 rounded-full hover:bg-violet-100"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-violet-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-violet-900 ml-4">
          {name ? `Chat with ${name}` : 'Chat'}
        </h2>
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  </div>
);

export default Home;