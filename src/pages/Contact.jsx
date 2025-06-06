import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Star } from 'lucide-react';
import { db, auth } from '../firebase';
import { ref, push } from 'firebase/database';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value // This correctly updates the state based on the input's 'name' attribute
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const feedbackRef = ref(db, 'feedback');
      const feedbackData = {
        name: formData.name,
        email: formData.email,
        feedback: formData.feedback,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid || 'anonymous' // Use 'anonymous' if no user is logged in
      };

      await push(feedbackRef, feedbackData); // This pushes the data to Firebase
      setSuccess(true);
      setFormData({ name: '', email: '', feedback: '' }); // Clear form on success
    } catch (err) {
      console.error("Error submitting feedback: ", err); // Log the actual error for debugging
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Email Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Mail className="text-violet-600 w-6 h-6 mr-3" />
            <h1 className="text-2xl font-bold text-violet-900">Contact Us</h1>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              Have any questions, problems, or want to share your thoughts? Feel free to reach out to us!
            </p>
            <div className="flex items-center space-x-2 bg-violet-50 p-3 rounded-lg">
              <Mail className="text-violet-600 w-5 h-5" />
              <span className="text-violet-700 font-medium">
                findcrushpoornima@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center mb-6">
            <Star className="text-yellow-400 w-6 h-6 mr-3" />
            <h2 className="text-2xl font-bold text-violet-900">Send Feedback</h2>
          </div>
          <div className="space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}> {/* Add onSubmit to the form */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <div className="relative">
                  <input
                    type="text"
                    id="name" // Add id
                    name="name" // Add name attribute
                    value={formData.name} // Bind value to state
                    onChange={handleChange} // Add onChange handler
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 px-4 py-3 text-base pl-9"
                    placeholder="Your name"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">👤</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    id="email" // Add id
                    name="email" // Add name attribute
                    value={formData.email} // Bind value to state
                    onChange={handleChange} // Add onChange handler
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 px-4 py-3 text-base pl-9"
                    placeholder="Your email"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">📧</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Feedback</label>
                <div className="relative">
                  <textarea
                    id="feedback" // Add id
                    name="feedback" // Add name attribute
                    value={formData.feedback} // Bind value to state
                    onChange={handleChange} // Add onChange handler
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 px-4 py-3 text-base"
                    placeholder="Share your thoughts..."
                  />
                  <div className="absolute top-0 left-0 pl-3 pt-3 flex items-start pointer-events-none"> {/* Adjusted icon position for textarea */}
                  </div>
                </div>
              </div>
              {loading ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-violet-600 text-white py-2 px-4 rounded-md opacity-75 cursor-not-allowed flex items-center justify-center"
                >
                  <span className="animate-spin mr-2">⏳</span> Sending...
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                >
                  Send Feedback
                </button>
              )}
              {success && (
                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                  Feedback submitted successfully! We'll get back to you soon.
                </div>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;