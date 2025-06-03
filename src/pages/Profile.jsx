import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        } else {
          setError('User data not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-violet-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-violet-700 px-6 py-4">
            <h1 className="text-2xl font-semibold text-white">Profile</h1>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Profile Picture and Name Section */}
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-bold text-violet-700 mr-4">
                {userData?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userData?.name}</h2>
                <p className="text-gray-600">{userData?.email}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Gender</label>
                  <p className="mt-1 text-lg text-gray-900">{userData?.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Year</label>
                  <p className="mt-1 text-lg text-gray-900">{userData?.year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Branch</label>
                  <p className="mt-1 text-lg text-gray-900">{userData?.branch}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Residence</label>
                  <p className="mt-1 text-lg text-gray-900">{userData?.residence}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Bio</label>
                  <p className="mt-1 text-lg text-gray-900">{userData?.bio}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Member Since</label>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(userData?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 