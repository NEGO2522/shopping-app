import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // Convert email to safe path
    const safeEmail = user.email.replace(/\./g, ',');
    const notificationsRef = ref(db, `userNotifications/${safeEmail}/notifications`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        // Convert the object to array and add the key as id
        const notificationsArray = Object.entries(snapshot.val()).map(([id, notification]) => ({
          id,
          ...notification
        }));
        
        // Sort notifications by timestamp in descending order (newest first)
        notificationsArray.sort((a, b) => b.timestamp - a.timestamp);
        
        setNotifications(notificationsArray);

        // Mark all unread notifications as read
        const updates = {};
        notificationsArray.forEach(notification => {
          if (!notification.read) {
            updates[`userNotifications/${safeEmail}/notifications/${notification.id}/read`] = true;
          }
        });

        if (Object.keys(updates).length > 0) {
          update(ref(db), updates);
        }
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <div className="text-xl text-violet-700">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-violet-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-violet-900 mb-6">Notifications</h1>
        
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No notifications yet! 🦋</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${
                  !notification.read ? 'border-l-4 border-violet-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-800 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="bg-violet-100 text-violet-800 text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notification; 