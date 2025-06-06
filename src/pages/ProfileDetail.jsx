import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref, get, push, set } from 'firebase/database';
import { FiArrowLeft, FiMail, FiMessageCircle } from 'react-icons/fi';
import Chat from '../components/Chat';

function ProfileDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [hasSentCrush, setHasSentCrush] = useState(false);
  const [hasMutualCrush, setHasMutualCrush] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
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

        // Fetch profile data
        const profileRef = ref(db, `users/${userId}`);
        const profileSnapshot = await get(profileRef);
        
        if (profileSnapshot.exists()) {
          setProfile(profileSnapshot.val());
        } else {
          setError('Profile not found');
        }

        // Check if crush was sent
        const sentCrushRef = ref(db, `sentCrushes/${currentUser.uid}/${userId}`);
        const sentCrushSnapshot = await get(sentCrushRef);
        setHasSentCrush(sentCrushSnapshot.exists());

        // Check if they sent a crush to current user
        const receivedCrushRef = ref(db, `sentCrushes/${userId}/${currentUser.uid}`);
        const receivedCrushSnapshot = await get(receivedCrushRef);
        
        // Set mutual crush status
        setHasMutualCrush(sentCrushSnapshot.exists() && receivedCrushSnapshot.exists());

        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, navigate]);

  const handleSendCrush = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUserData || !profile) {
        navigate('/login');
        return;
      }

      // Create notification
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

      await push(notificationRef, newNotification);

      // Record crush
      const sentCrushRef = ref(db, `sentCrushes/${currentUser.uid}/${profile.uid}`);
      await set(sentCrushRef, {
        timestamp: Date.now(),
        targetUserId: profile.uid,
        targetUserEmail: profile.email,
        targetUserName: profile.name
      });

      setHasSentCrush(true);
      alert("Crush sent successfully! 💌");
    } catch (err) {
      console.error("Error sending crush:", err);
      alert("Failed to send crush. Please try again.");
    }
  };

  const shouldShowCrushButton = () => {
    if (!currentUserData || !profile) return false;
    return currentUserData.gender !== profile.gender;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <div className="text-xl text-violet-700">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-violet-50">
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
                  Chat with {profile?.name}
                </h2>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
              <Chat 
                recipientId={profile?.uid} 
                recipientName={profile?.name} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-violet-600 hover:text-violet-700"
        >
          <FiArrowLeft className="mr-2" />
          Back to profiles
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-violet-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center text-4xl font-bold text-violet-700 overflow-hidden">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={`${profile.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <p className="text-violet-200">{profile.year}</p>
                <p className="text-violet-200">{profile.branch}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Info</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Branch</span>
                    <p className="text-gray-800">{profile.branch}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Year</span>
                    <p className="text-gray-800">{profile.year}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Residence</span>
                    <p className="text-gray-800">{profile.residence}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-gray-800">{profile.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bio</span>
                    <p className="text-gray-800 whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                  {profile.interests && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Interests</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              {shouldShowCrushButton() && (
                <>
                  {hasMutualCrush ? (
                    <button
                      onClick={() => setActiveChatId(profile.uid)}
                      className="flex-1 px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                    >
                      <FiMessageCircle className="text-xl" />
                      <span>Open Chat</span>
                    </button>
                  ) : (
                    <button
                      className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 font-medium ${
                        hasSentCrush
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-violet-600 text-white hover:bg-violet-700'
                      }`}
                      onClick={handleSendCrush}
                      disabled={hasSentCrush}
                    >
                      {hasSentCrush ? '💝 Crush Sent' : '💌 Send Crush'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetail; 