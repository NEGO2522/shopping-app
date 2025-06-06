import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { ref, get, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Initialize Firebase Storage
const storage = getStorage();

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const userRef = ref(db, 'users/' + user.uid);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          setUserData(snapshot.val());
          setForm(snapshot.val());
        } else {
          setError('User data not found');
        }
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image change with preview and file storage
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Store the file for later upload

      // Create preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uid) => {
    if (!imageFile) return null;
    
    try {
      const imageRef = storageRef(storage, `profile_images/${uid}/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }

      let updatedForm = { ...form };

      // Upload new image if one was selected
      if (imageFile) {
        try {
          const photoURL = await uploadImage(user.uid);
          updatedForm = { ...updatedForm, photoURL };
        } catch (imageError) {
          setError('Failed to upload profile image. Please try again.');
          setSaving(false);
          return;
        }
      }

      const userRef = ref(db, 'users/' + user.uid);
      await update(userRef, updatedForm);
      setUserData(updatedForm);
      setEditMode(false);
      setShowSaved(true);
      setImageFile(null); // Clear the stored file
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-yellow-100 flex items-center justify-center">
        <div className="text-xl text-violet-700 font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-yellow-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  // Helper for input class
  const inputClass = editMode
    ? "w-full bg-gray-50 border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-2 mb-4 transition"
    : "w-full bg-white border border-transparent rounded-lg px-4 py-2 mb-4";

  // Helper for white box after save
  const boxClass = showSaved && !editMode
    ? "bg-white/90 rounded-xl shadow-lg p-6 mb-4 border border-blue-100"
    : "bg-white/80 rounded-xl shadow p-6 mb-4";

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Card */}
        <div className="bg-white/80 rounded-2xl shadow-2xl p-8 relative">
          {/* Top Section: Avatar, Name, Email, Edit Button */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-10">
            <div className="flex items-center gap-6 relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-300 to-blue-200 flex items-center justify-center text-5xl font-extrabold text-violet-700 shadow-lg border-4 border-white overflow-hidden relative">
                {profileImage && editMode ? (
                  <img
                    src={profileImage}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userData?.name?.charAt(0)?.toUpperCase() || '?'
                )}
                {editMode && (
                  <label
                    htmlFor="profile-image-upload"
                    className="absolute bottom-2 right-2 bg-white/80 rounded-full p-2 cursor-pointer shadow hover:bg-white transition"
                    title="Change photo"
                  >
                    <FaCamera className="text-violet-700 text-lg" />
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{userData?.name}</h2>
                <p className="text-gray-500 text-lg">{userData?.email}</p>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              {editMode ? (
                <div className="flex gap-3">
                  <button
                    className="px-7 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg font-semibold shadow hover:from-green-500 hover:to-green-700 transition"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="px-7 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
                    onClick={() => {
                      setEditMode(false);
                      setForm(userData);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="px-7 py-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Saved notification */}
          {showSaved && (
            <div className="mb-6 text-center">
              <span className="inline-block px-6 py-3 bg-white text-green-700 border border-green-400 rounded-xl font-bold shadow-lg text-lg tracking-wide">
                Profile saved!
              </span>
            </div>
          )}

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <div className={boxClass}>
              <label className="block text-base font-semibold text-violet-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                className={inputClass}
                value={editMode ? form?.name || '' : userData?.name || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
              <hr className="my-3 border-blue-100" />
              <label className="block text-base font-semibold text-violet-700 mb-1">Gender</label>
              <input
                type="text"
                name="gender"
                className={inputClass}
                value={editMode ? form?.gender || '' : userData?.gender || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
              <hr className="my-3 border-blue-100" />
              <label className="block text-base font-semibold text-violet-700 mb-1">Language</label>
              <input
                type="text"
                name="language"
                className={inputClass}
                value={editMode ? form?.language || '' : userData?.language || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
              <hr className="my-3 border-blue-100" />
              <label className="block text-base font-semibold text-violet-700 mb-1">Club/Society</label>
              <input
                type="text"
                name="club"
                className={inputClass}
                value={editMode ? form?.club || '' : userData?.club || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
            {/* RIGHT COLUMN */}
            <div className={boxClass}>
              <label className="block text-base font-semibold text-violet-700 mb-1">Year</label>
              <input
                type="text"
                name="year"
                className={inputClass}
                value={editMode ? form?.year || '' : userData?.year || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
              <hr className="my-3 border-blue-100" />
              <label className="block text-base font-semibold text-violet-700 mb-1">Branch</label>
              <input
                type="text"
                name="branch"
                className={inputClass}
                value={editMode ? form?.branch || '' : userData?.branch || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
              <hr className="my-3 border-blue-100" />
              <label className="block text-base font-semibold text-violet-700 mb-1">Nick Name</label>
              <input
                type="text"
                name="nickname"
                className={inputClass}
                value={editMode ? form?.nickname || '' : userData?.nickname || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
              <hr className="my-3 border-blue-100" />
              <label className="block text-base font-semibold text-violet-700 mb-1">Hostel/Residence</label>
              <input
                type="text"
                name="residence"
                className={inputClass}
                value={editMode ? form?.residence || '' : userData?.residence || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
          </div>

          {/* Email Section */}
          <div className="mt-10 flex items-center bg-gradient-to-r from-blue-100 via-purple-100 to-yellow-100 rounded-xl p-5 shadow-inner">
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-extrabold mr-5 shadow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1"></path>
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{userData?.email}</div>
              <div className="text-gray-500 text-sm">
                {userData?.createdAt ? (
                  <>
                    {Math.floor((Date.now() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;