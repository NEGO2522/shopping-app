import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

function Navbar({ user }) {
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav style={{
      padding: '1rem',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: 'bold', fontSize: '1.5rem' }}>
        CampusCrush
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div 
              style={{ 
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/profile')}
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #4f46e5',
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                }}>
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                color: '#4f46e5',
                fontWeight: '600',
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link 
            to="/login"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 