import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { ref, query, orderByChild, onValue, update, remove, get, push } from 'firebase/database';
import { FiHeart, FiMessageCircle, FiClock, FiTrash2, FiSend } from 'react-icons/fi';

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Fetch user info
    const fetchUserInfo = async () => {
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
    };

    fetchUserInfo();

    const thoughtsRef = ref(db, 'anonymousThoughts');
    const thoughtsQuery = query(thoughtsRef, orderByChild('authorId'));

    const unsubscribe = onValue(thoughtsQuery, async (snapshot) => {
      if (snapshot.exists()) {
        const thoughtsData = [];
        snapshot.forEach((childSnapshot) => {
          const thought = childSnapshot.val();
          if (thought.authorId === currentUser.uid) {
            thoughtsData.unshift({
              id: childSnapshot.key,
              ...thought
            });
          }
        });
        setPosts(thoughtsData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async (post) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const thoughtRef = ref(db, `anonymousThoughts/${post.id}`);
      const userLikesRef = ref(db, `userLikes/${currentUser.uid}/${post.id}`);

      if (userLikes[post.id]) {
        // Unlike
        await update(thoughtRef, {
          [`likedBy/${currentUser.uid}`]: null,
          likes: (post.likes || 0) - 1
        });
        await remove(userLikesRef);
        setUserLikes(prev => {
          const newLikes = { ...prev };
          delete newLikes[post.id];
          return newLikes;
        });
      } else {
        // Like
        await update(thoughtRef, {
          [`likedBy/${currentUser.uid}`]: true,
          likes: (post.likes || 0) + 1
        });
        await update(ref(db, `userLikes/${currentUser.uid}`), {
          [post.id]: true
        });
        setUserLikes(prev => ({
          ...prev,
          [post.id]: true
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const thoughtRef = ref(db, `anonymousThoughts/${postId}`);
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

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Delete the post
      await remove(ref(db, `anonymousThoughts/${postId}`));

      // Remove from user's likes if it exists
      if (userLikes[postId]) {
        await remove(ref(db, `userLikes/${currentUser.uid}/${postId}`));
        setUserLikes(prev => {
          const newLikes = { ...prev };
          delete newLikes[postId];
          return newLikes;
        });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getCurrentNickname = () => {
    const user = auth.currentUser;
    if (!user) return 'Anonymous';
    return `User${user.uid.slice(-4).toUpperCase()}`;
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
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <div className="text-xl text-violet-700">Loading your posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-violet-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-violet-900 mb-6">My Posts</h1>
        
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-3">💭</div>
              <p className="text-gray-600">You haven't posted any thoughts yet!</p>
              <p className="text-sm text-violet-600 mt-2">
                Share your thoughts with the campus community
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-violet-200 flex items-center justify-center text-xl font-bold text-violet-700">
                      {getCurrentNickname()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getCurrentNickname()}
                      </h3>
                      <p className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 text-gray-500 hover:text-red-500"
                      onClick={() => handleDelete(post.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <p className="text-lg text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <button 
                    onClick={() => handleLike(post)}
                    className={`flex items-center space-x-2 transition-colors duration-200 cursor-pointer ${
                      userLikes[post.id] ? 'text-pink-500 hover:text-pink-600' : 'hover:text-violet-600'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${userLikes[post.id] ? 'fill-current' : ''}`} />
                    <span>{post.likes || 0}</span>
                  </button>
                  <button 
                    onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}
                    className="flex items-center space-x-2 hover:text-violet-600 transition-colors duration-200 cursor-pointer"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                    <span>{post.comments?.length || 0}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentId === post.id && (
                  <div className="mt-4 pt-4 border-t border-violet-100">
                    {post.comments && post.comments.length > 0 && (
                      <div className="mb-4 space-y-3">
                        {post.comments.map((comment, index) => (
                          <div key={index} className="bg-violet-50 rounded-lg p-3">
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
                        onClick={() => handleComment(post.id)}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPosts; 