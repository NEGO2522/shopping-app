import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { ref, push, get, query, orderByChild, onValue, update, remove } from 'firebase/database';
import { FiHeart, FiMessageCircle, FiClock, FiX, FiSend, FiPlus } from 'react-icons/fi';

function AnonymousThoughts() {
  const [thoughts, setThoughts] = useState([]);
  const [newThought, setNewThought] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [userLikes, setUserLikes] = useState({});
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    const thoughtsRef = ref(db, 'anonymousThoughts');
    const thoughtsQuery = query(thoughtsRef, orderByChild('timestamp'));

    const fetchUserNames = async (thoughtsData) => {
      const userPromises = thoughtsData.map(async (thought) => {
        const userRef = ref(db, `users/${thought.authorId}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          return {
            ...thought,
            authorName: userData.name,
            authorEmail: userData.email
          };
        }
        return thought;
      });
      return Promise.all(userPromises);
    };

    const unsubscribe = onValue(thoughtsQuery, async (snapshot) => {
      if (snapshot.exists()) {
        const thoughtsData = [];
        snapshot.forEach((childSnapshot) => {
          thoughtsData.unshift({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        const thoughtsWithNames = await fetchUserNames(thoughtsData);
        setThoughts(thoughtsWithNames);
      }
      setLoading(false);
    });

    // Fetch current user's info
    const fetchCurrentUserInfo = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          setCurrentUserName(userData.name);
          setCurrentUserEmail(userData.email);
        }

        // Fetch user's likes
        const likesRef = ref(db, `userLikes/${currentUser.uid}`);
        const likesSnapshot = await get(likesRef);
        if (likesSnapshot.exists()) {
          setUserLikes(likesSnapshot.val());
        }
      }
    };

    fetchCurrentUserInfo();
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
        authorName: currentUserName,
        authorEmail: currentUserEmail,
        likes: 0,
        likedBy: {},
        comments: []
      });

      setNewThought('');
      setShowPostModal(false);
    } catch (error) {
      console.error('Error posting thought:', error);
    }
  };

  const handleLike = async (thought) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const thoughtRef = ref(db, `anonymousThoughts/${thought.id}`);
      const userLikesRef = ref(db, `userLikes/${currentUser.uid}/${thought.id}`);

      if (userLikes[thought.id]) {
        // Unlike
        await update(thoughtRef, {
          [`likedBy/${currentUser.uid}`]: null,
          likes: (thought.likes || 0) - 1
        });
        await remove(userLikesRef);
        setUserLikes(prev => {
          const newLikes = { ...prev };
          delete newLikes[thought.id];
          return newLikes;
        });
      } else {
        // Like
        await update(thoughtRef, {
          [`likedBy/${currentUser.uid}`]: true,
          likes: (thought.likes || 0) + 1
        });
        await update(ref(db, `userLikes/${currentUser.uid}`), {
          [thought.id]: true
        });
        setUserLikes(prev => ({
          ...prev,
          [thought.id]: true
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (thoughtId) => {
    if (!newComment.trim()) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const thoughtRef = ref(db, `anonymousThoughts/${thoughtId}`);
      const thoughtSnapshot = await get(thoughtRef);
      
      if (thoughtSnapshot.exists()) {
        const thought = thoughtSnapshot.val();
        const comments = thought.comments || [];
        
        comments.push({
          content: newComment.trim(),
          timestamp: Date.now(),
          authorId: currentUser.uid,
          authorName: currentUserName,
          authorEmail: currentUserEmail
        });

        await update(thoughtRef, { comments });
        setNewComment('');
        setActiveCommentId(null);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
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
    <div className="bg-white rounded-lg shadow-lg p-6 relative">
      <h2 className="text-2xl font-bold text-violet-900 mb-6 flex items-center justify-center">
        <span className="text-3xl mr-2">💭</span>
        Campus Thoughts
      </h2>

      {/* Thoughts list */}
      <div className="space-y-6">
        {thoughts.map((thought) => (
          <div
            key={thought.id}
            className="bg-violet-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-violet-200 flex items-center justify-center text-xl font-bold text-violet-700">
                {thought.authorName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-violet-900">{thought.authorName || 'Anonymous'}</p>
                <div className="flex items-center space-x-1 text-sm text-violet-600">
                  <FiClock className="w-4 h-4" />
                  <span>{formatTimestamp(thought.timestamp)}</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">
              {thought.content}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <button 
                onClick={() => handleLike(thought)}
                className={`flex items-center space-x-2 transition-colors duration-200 cursor-pointer ${
                  userLikes[thought.id] ? 'text-pink-500 hover:text-pink-600' : 'hover:text-violet-600'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${userLikes[thought.id] ? 'fill-current' : ''}`} />
                <span>{thought.likes || 0}</span>
              </button>
              <button 
                onClick={() => setActiveCommentId(activeCommentId === thought.id ? null : thought.id)}
                className="flex items-center space-x-2 hover:text-violet-600 transition-colors duration-200 cursor-pointer"
              >
                <FiMessageCircle className="w-5 h-5" />
                <span>{thought.comments?.length || 0}</span>
              </button>
            </div>

            {/* Comments Section */}
            {activeCommentId === thought.id && (
              <div className="mt-4 pt-4 border-t border-violet-100">
                {thought.comments && thought.comments.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {thought.comments.map((comment, index) => (
                      <div key={index} className="bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700">
                            {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-violet-900">{comment.authorName}</p>
                            <p className="text-xs text-violet-600">{formatTimestamp(comment.timestamp)}</p>
                          </div>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 rounded-lg border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleComment(thought.id)}
                    disabled={!newComment.trim()}
                    className={`p-2 rounded-lg ${
                      newComment.trim()
                        ? 'text-violet-600 hover:bg-violet-100'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {thoughts.length === 0 && (
          <div className="text-center py-12 bg-violet-50 rounded-lg">
            <div className="text-4xl mb-3">💭</div>
            <h3 className="text-xl font-semibold text-violet-900 mb-2">No thoughts yet</h3>
            <p className="text-violet-600">
              Be the first one to share your thoughts with the campus!
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowPostModal(true)}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 px-6 py-4 space-x-2"
        aria-label="Create new post"
      >
        <FiPlus className="w-5 h-5" />
        <span className="font-medium">Make Post</span>
      </button>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-violet-900">Share Your Thoughts</h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handlePostThought}>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center text-lg font-bold text-violet-700">
                    {currentUserName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-violet-900">{currentUserName || 'Anonymous'}</p>
                    <p className="text-sm text-violet-600">Share your thoughts with the campus</p>
                  </div>
                </div>
                <textarea
                  value={newThought}
                  onChange={(e) => setNewThought(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 rounded-lg border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none bg-white"
                  rows="4"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {newThought.length}/500 characters
                  </span>
                  <div className="space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newThought.trim()}
                      className={`px-6 py-2 rounded-md font-medium ${
                        newThought.trim()
                          ? 'bg-violet-600 text-white hover:bg-violet-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnonymousThoughts; 