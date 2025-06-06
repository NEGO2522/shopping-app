import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Initialize Firebase Storage
const storage = getStorage();

// Memoize the InputField component to prevent unnecessary re-renders
const InputField = memo(({ label, type = "text", value, onChange, placeholder, options }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    {type === "select" ? (
      <select
        value={value}
        onChange={onChange}
        required
        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200"
      >
        <option value="">{placeholder}</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={type !== "file"}
        placeholder={placeholder}
        className={`block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 ${
          type === "file" ? "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" : ""
        }`}
        accept={type === "file" ? "image/*" : undefined}
      />
    )}
  </div>
));

// Add display name for the memoized component
InputField.displayName = 'InputField';

const UserDetailsForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    year: '',
    branch: '',
    residence: '',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (uid) => {
    if (!profileImage) return null;
    
    const imageRef = storageRef(storage, `profile_images/${uid}/${profileImage.name}`);
    await uploadBytes(imageRef, profileImage);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in first.");
      setLoading(false);
      return;
    }

    const { name, gender, year, branch, residence, bio } = formData;
    if (!name || !gender || !year || !branch || !residence || !bio) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    try {
      console.log("Starting data save process...");
      const userRef = ref(db, 'users/' + user.uid);
      
      // Upload image if selected
      let photoURL = user.photoURL;
      if (profileImage) {
        try {
          photoURL = await uploadImage(user.uid);
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          setError("Failed to upload profile image. Please try again.");
          setLoading(false);
          return;
        }
      }

      const userData = {
        name,
        gender,
        year,
        branch,
        residence,
        bio,
        email: user.email || user.phoneNumber,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        displayName: user.displayName || name,
        photoURL
      };

      console.log("Saving user data:", userData);
      await set(userRef, userData);
      console.log("Data saved successfully");
      
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const savedData = snapshot.val();
        if (savedData.name && savedData.email && savedData.uid) {
          console.log("Data verification successful:", savedData);
          setLoading(false);
          console.log("Navigating to home page...");
          try {
            navigate('/home', { replace: true });
          } catch (navError) {
            console.error("Navigation failed, trying fallback:", navError);
            window.location.href = '/home';
          }
          return;
        } else {
          throw new Error("Data verification failed - missing required fields");
        }
      } else {
        throw new Error("Data verification failed - no data found");
      }
    } catch (err) {
      console.error("Error during save/verification:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const yearOptions = [
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" }
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }
  ];

  const residenceOptions = [
    { value: "Hostel", label: "Hostel" },
    { value: "Outside", label: "Outside" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200 to-violet-300 opacity-20 blur-3xl transform rotate-12" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 opacity-20 blur-3xl transform -rotate-12" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Let others know more about you
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl space-y-8 transform hover:scale-[1.01] transition-all duration-300">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-violet-100 flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl text-violet-300">👤</div>
                )}
              </div>
              <InputField
                type="file"
                label="Profile Picture"
                onChange={handleImageChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="Enter your full name"
              />

              <InputField
                label="Gender"
                type="select"
                value={formData.gender}
                onChange={handleChange('gender')}
                placeholder="Select gender"
                options={genderOptions}
              />

              <InputField
                label="Year"
                type="select"
                value={formData.year}
                onChange={handleChange('year')}
                placeholder="Select year"
                options={yearOptions}
              />

              <InputField
                label="Branch / Department"
                value={formData.branch}
                onChange={handleChange('branch')}
                placeholder="e.g., Computer Science"
              />

              <InputField
                label="Residence"
                type="select"
                value={formData.residence}
                onChange={handleChange('residence')}
                placeholder="Select residence"
                options={residenceOptions}
              />

              <InputField
                label="Bio (one line)"
                value={formData.bio}
                onChange={handleChange('bio')}
                placeholder="Tell us about yourself in one line"
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 font-medium transform hover:scale-[1.02] transition-all duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? "Saving..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsForm;

