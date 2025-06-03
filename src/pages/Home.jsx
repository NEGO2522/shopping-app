import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { ref, get } from "firebase/database";

function Home() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
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
       
       
      

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.uid}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Profile Card Header */}
              <div className="bg-violet-600 px-4 py-3">
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

              {/* Profile Card Body */}
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

                {/* Action Button */}
                <button
                  className="mt-4 w-full bg-violet-100 text-violet-700 px-4 py-2 rounded-md hover:bg-violet-200 transition-colors duration-200 font-medium"
                  onClick={() => {
                    // TODO: Implement crush functionality
                    console.log("Send crush to:", profile.name);
                  }}
                >
                  💌 Send Crush
                </button>
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
