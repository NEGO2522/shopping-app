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
  FiMessageSquare
} from "react-icons/fi";
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
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'people'
  const [viewingSentCrushes, setViewingSentCrushes] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);

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
        meSnap.exists() && setCurrentUserData(meSnap.val());

        // sent
        const sentSnap = await get(ref(db, `sentCrushes/${currentUser.uid}`));
        sentSnap.exists() && setSentCrushes(sentSnap.val());

        // received → where I'm target
        const allSnap = await get(ref(db, "sentCrushes"));
        if (allSnap.exists()) {
          const rec = {};
          Object.entries(allSnap.val()).forEach(([sender, list]) => {
            Object.keys(list).forEach((tgt) => {
              if (tgt === currentUser.uid) rec[sender] = list[tgt];
            });
          });
          setReceivedCrushes(rec);
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
        console.error(err);
        setError("Failed to load profiles");
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
        setMatchedProfile(snap.val().profile);
        setShowCongrats(true);
        remove(notifRef);
      }
    });
    return () => unsub();
  }, []);

  /* ---------- helpers ---------- */
  const filtered = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    const isOppositeGender = currentUserData?.gender !== p.gender;
    return (p.name.toLowerCase().includes(q) || p.branch.toLowerCase().includes(q)) && isOppositeGender;
  });
  const hasSent = (id) => !!sentCrushes[id];
  const hasMutual = (id) => !!sentCrushes[id] && !!receivedCrushes[id];
  const mutuals = profiles.filter((p) => hasMutual(p.uid));
  const sentList = profiles.filter((p) => hasSent(p.uid));

  /* ---------- actions ---------- */
  const handleSendCrush = async (p) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUserData) return navigate("/login");
      // push simple sent flag (notification code omitted for brevity)
      await set(ref(db, `sentCrushes/${currentUser.uid}/${p.uid}`), {
        timestamp: Date.now()
      });
      setSentCrushes((prev) => ({ ...prev, [p.uid]: { timestamp: Date.now() } }));
      alert("Crush sent! 💌");
    } catch (e) {
      console.error(e);
      alert("Error – try again");
    }
  };

  const openProfile = (uid) => navigate(`/profile/${uid}`);

  /* ---------- UI ---------- */
  if (loading)
    return (
      <Centered>Loading profiles…</Centered>
    );
  if (error)
    return (
      <Centered error>{error}</Centered>
    );

  return (
    <div className="min-h-screen bg-violet-50">
      {/* top spacing for fixed navbar */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* search */}
        <SearchBar
          searchRef={searchRef}
          query={searchQuery}
          setQuery={setSearchQuery}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          activeTab={activeTab}
          list={filtered}
          onSelect={(uid) => {
            openProfile(uid);
            setSearchQuery("");
            setShowDropdown(false);
          }}
        />

        {/* tabs */}
        <Tabs active={activeTab} onChange={setActiveTab} />

        {/* posts vs people */}
        {activeTab === "posts" ? (
          <div className="mb-8">
            <AnonymousThoughts />
          </div>
        ) : (
          <Fragment>
            {/* mutual */}
            {!viewingSentCrushes && mutuals.length > 0 && (
              <section className="mb-10">
                <SectionHeading
                  title="Mutual Crushes"
                  icon="💘"
                  actionLabel="View Sent"
                  onAction={() => setViewingSentCrushes(true)}
                />
                <CardGrid>
                  {mutuals.map((p) => (
                    <ProfileCard
                      key={p.uid}
                      p={p}
                      actionLabel="Chat"
                      actionIcon={<FiMessageCircle />}
                      onAction={() => setActiveChatId(p.uid)}
                      onOpen={() => openProfile(p.uid)}
                    />
                  ))}
                </CardGrid>
              </section>
            )}

            {/* main list / sent list */}
            <CardGrid>
              {(viewingSentCrushes ? sentList : filtered)
                .filter((p) => !hasMutual(p.uid))
                .map((p) => (
                  <ProfileCard
                    key={p.uid}
                    p={p}
                    actionLabel={!hasSent(p.uid) ? "Crush" : undefined}
                    actionIcon={<span className="text-lg">💘</span>}
                    onAction={() => handleSendCrush(p)}
                    onOpen={() => openProfile(p.uid)}
                  />
                ))}
            </CardGrid>

            {/* empty states */}
            {viewingSentCrushes && sentList.length === 0 && (
              <Empty msg="No sent crushes yet" />
            )}
            {!viewingSentCrushes && profiles.length === 0 && (
              <Empty msg="No profiles available right now" />
            )}
          </Fragment>
        )}
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
        <MatchModal
          name={matchedProfile.name}
          onChat={() => {
            setActiveChatId(matchedProfile.uid);
            setShowCongrats(false);
          }}
          onClose={() => setShowCongrats(false)}
        />
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

const Tabs = ({ active, onChange }) => (
  <div className="flex justify-center mb-8">
    <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
      {[
        { id: "posts", label: "Posts", icon: FiMessageSquare },
        { id: "people", label: "People", icon: FiUser }
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`flex items-center px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            active === id
              ? "bg-gray-100 text-gray-800"
              : "text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => onChange(id)}
        >
          <Icon className="mr-2" />
          {label}
        </button>
      ))}
    </div>
  </div>
);

const SearchBar = ({
  searchRef,
  query,
  setQuery,
  showDropdown,
  setShowDropdown,
  activeTab,
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
        placeholder={
          activeTab === "people" ? "Search people…" : "Search posts…"
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
      />
    </div>

    {activeTab === "people" && showDropdown && query && (
      <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
        {list.length ? (
          list.map((p) => (
            <button
              key={p.uid}
              onClick={() => onSelect(p.uid)}
              className="w-full text-left px-4 py-2 hover:bg-violet-50 flex items-center space-x-3 border-b last:border-none"
            >
              <Avatar url={p.photoURL} name={p.name} size="8" />
              <span className="font-medium text-sm">{p.name}</span>
            </button>
          ))
        ) : (
          <p className="p-4 text-center text-gray-500 text-sm">No match</p>
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

const ProfileCard = ({ p, actionLabel, actionIcon, onAction, onOpen }) => (
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
            {actionLabel === 'Crush' && (
              <span className="text-gray-500 text-sm">
                <span className="text-violet-600">❤️</span>
                <span> Crush not sent</span>
              </span>
            )}
            {actionLabel === undefined && (
              <span className="px-3 py-1 bg-violet-200 text-violet-800 text-sm rounded-full flex items-center space-x-1">
                <span className="text-violet-600">✓</span>
                <span>Crush sent</span>
              </span>
            )}
          </div>
          {actionLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                actionLabel === 'Crush' 
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
              disabled={actionLabel !== 'Crush'}
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
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`w-${size} h-${size} rounded-full bg-violet-100 flex items-center justify-center overflow-hidden shrink-0 relative`}>
      {isLoading && (
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
            {name[0].toUpperCase()}
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
  <div className="text-center py-12">
    <p className="text-gray-600 text-base">{msg}</p>
  </div>
);

const ChatOverlay = ({ name, onClose, children }) => (
  <div className="fixed inset-0 bg-violet-50 z-50 flex flex-col">
    <header className="flex items-center p-4 shadow bg-white">
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
      <h2 className="text-lg font-semibold text-violet-900 ml-4">Chat with {name}</h2>
    </header>
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
);

const MatchModal = ({ name, onChat, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative text-center">
      <button className="absolute top-3 right-3 text-gray-400" onClick={onClose}>
        ✕
      </button>
      <div className="text-5xl mb-4">💘</div>
      <h3 className="text-2xl font-bold text-violet-900 mb-2">It's a Match!</h3>
      <p className="text-gray-600 mb-6">You and {name} like each other</p>
      <button
        onClick={onChat}
        className="w-full py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
      >
        Start Chat
      </button>
    </div>
  </div>
);

export default Home;
