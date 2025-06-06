import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { ref, push, get, query, orderByChild, onValue } from 'firebase/database';
import { FiHeart, FiMessageCircle, FiClock } from 'react-icons/fi';

function AnonymousThoughts() {
  const [thoughts, setThoughts] = useState([]);
  const [newThought, setNewThought] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const thoughtsRef = ref(db, 'anonymousThoughts');
    const thoughtsQuery = query(thoughtsRef, orderByChild('timestamp'));

    const unsubscribe = onValue(thoughtsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const thoughtsData = [];
        snapshot.forEach((childSnapshot) => {
          thoughtsData.unshift({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        setThoughts(thoughtsData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePostThought = async (e) => {
    e.preventDefault();
    if (!newThought.trim()) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const thoughtsRef = ref(db, 'anonymousThoughts');
      await push(thoughtsRef, {
        content: newThought.trim(),
        timestamp: Date.now(),
        authorId: currentUser.uid,
        likes: 0,
        comments: []
      });

      setNewThought('');
    } catch (error) {
      console.error('Error posting thought:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-violet-600">Loading thoughts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-violet-900 mb-6 flex items-center justify-center">
        <span className="text-3xl mr-2">💭</span>
        Anonymous Thoughts
      </h2>

      {/* Post new thought */}
      <form onSubmit={handlePostThought} className="mb-8">
        <div className="flex flex-col space-y-3">
          <textarea
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            placeholder="Share your thoughts anonymously..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            rows="3"
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {newThought.length}/500 characters
            </span>
            <button
              type="submit"
              disabled={!newThought.trim()}
              className={`px-6 py-2 rounded-md font-medium ${
                newThought.trim()
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Post Anonymously
            </button>
          </div>
        </div>
      </form>

      {/* Thoughts list */}
      <div className="space-y-6">
        {thoughts.map((thought) => (
          <div
            key={thought.id}
            className="bg-violet-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <p className="text-gray-800 whitespace-pre-wrap mb-3">{thought.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 hover:text-violet-600">
                  <FiHeart />
                  <span>{thought.likes || 0}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-violet-600">
                  <FiMessageCircle />
                  <span>{thought.comments?.length || 0}</span>
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <FiClock className="w-4 h-4" />
                <span>{formatTimestamp(thought.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {thoughts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No thoughts shared yet. Be the first one to share!
          </div>
        )}
      </div>
    </div>
  );
}

export default AnonymousThoughts; 