import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar'; // Import Sidebar here to render globally
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
  const hideNavbarRoutes = ['/']; // routes where Navbar & Sidebar are hidden

  // Add sidebar state here
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle function
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

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
          element={user ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <Login />}
        />
      </Routes>
    </>
  );
}

export default App;
