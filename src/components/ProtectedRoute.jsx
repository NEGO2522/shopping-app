import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref, get } from 'firebase/database';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasUserDetails, setHasUserDetails] = useState(false);

  useEffect(() => {
    const checkUserDetails = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = ref(db, 'users/' + user.uid);
        const snapshot = await get(userRef);
        setHasUserDetails(snapshot.exists());
      } catch (error) {
        console.error("Error checking user details:", error);
      }
      setLoading(false);
    };

    checkUserDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!auth.currentUser) {
    return <Navigate to="/login" />;
  }

  if (!hasUserDetails) {
    return <Navigate to="/user-details" />;
  }

  return children;
};

export default ProtectedRoute; 