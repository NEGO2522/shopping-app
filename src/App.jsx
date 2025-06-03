import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import UserDetailsForm from './pages/UserDetailsForm';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar'; // Import Sidebar here to render globally
import ProtectedRoute from './components/ProtectedRoute';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <MainRoutes user={user} />
    </Router>
  );
}

function MainRoutes({ user }) {
  const location = useLocation();
  const hideNavbarRoutes = ['/','/user-details','/login']; // routes where Navbar & Sidebar are hidden

  // Add sidebar state here
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasUserDetails, setHasUserDetails] = useState(false);
  const [checkingDetails, setCheckingDetails] = useState(true);

  useEffect(() => {
    const checkUserDetails = async () => {
      if (!user) {
        setCheckingDetails(false);
        return;
      }

      try {
        const userRef = ref(db, 'users/' + user.uid);
        const snapshot = await get(userRef);
        setHasUserDetails(snapshot.exists());
      } catch (error) {
        console.error("Error checking user details:", error);
      }
      setCheckingDetails(false);
    };

    checkUserDetails();
  }, [user]);

  // Toggle function
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  if (checkingDetails) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && (
        <>
          <Navbar toggleSidebar={toggleSidebar} user={user} />
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            user 
              ? (hasUserDetails 
                  ? <Navigate to="/home" /> 
                  : <Navigate to="/user-details" />)
              : <Login />
          }
        />
        <Route 
          path="/user-details" 
          element={user ? <UserDetailsForm /> : <Navigate to="/login" />} 
        />
      </Routes>
    </>
  );
}

export default App;
