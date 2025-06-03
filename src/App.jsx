import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/login';
import Navbar from './components/Navbar';

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
      <Navbar user={user} />
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
    </Router>
  );
}

export default App;
