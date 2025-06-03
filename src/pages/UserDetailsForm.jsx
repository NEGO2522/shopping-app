import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref, set, get } from 'firebase/database';

const UserDetailsForm = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [residence, setResidence] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    if (!name || !gender || !year || !branch || !residence || !bio) {
      setError("Please fill all fields.");
      setLoading(false);
      return;
    }

    try {
      console.log("Starting data save process...");
      // Create a reference to the user's data location
      const userRef = ref(db, 'users/' + user.uid);
      
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
        photoURL: user.photoURL || null
      };

      console.log("Saving user data:", userData);
      // Set the user data
      await set(userRef, userData);
      console.log("Data saved successfully");
      
      // Verify the data was saved by reading it back
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const savedData = snapshot.val();
        // Basic verification that required fields are present
        if (savedData.name && savedData.email && savedData.uid) {
          console.log("Data verification successful:", savedData);
          setLoading(false); // Make sure to set loading to false before navigation
          console.log("Navigating to home page...");
          try {
            navigate('/home', { replace: true });
          } catch (navError) {
            console.error("Navigation failed, trying fallback:", navError);
            window.location.href = '/home';
          }
          return; // Exit the function after navigation
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

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  };

  const buttonStyle = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? "0.7" : "1",
    transition: "background-color 0.2s ease",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          Complete Your Profile
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label style={labelStyle}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Branch / Department</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={inputStyle}
                required
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label style={labelStyle}>Residence</label>
              <select
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Select residence</option>
                <option value="Hostel">Hostel</option>
                <option value="Outside">Outside</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Bio (one line)</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={inputStyle}
                required
                placeholder="Tell us about yourself in one line"
                maxLength={100}
              />
            </div>

            <button
              type="submit"
              style={buttonStyle}
              disabled={loading}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#4338ca";
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#4f46e5";
              }}
            >
              {loading ? "Saving..." : "Submit and Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsForm;

