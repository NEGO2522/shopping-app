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
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        userId: auth.currentUser?.uid
      };

      await push(feedbackRef, feedbackData);
      setSuccess(true);
      setFormData({ name: '', email: '', feedback: '' });
    } catch (err) {
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
            <p className="text-gray-600">
              We aim to respond to all inquiries within 24 hours. Please include your name and a detailed description of your issue or query.
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center mb-6">
            <Star className="text-yellow-400 w-6 h-6 mr-3" />
            <h2 className="text-2xl font-bold text-violet-900">Send Feedback</h2>
          </div>
          <div className="space-y-6">
            <p className="text-gray-600">
              We value your feedback! Help us improve Campus Connect by sharing your thoughts and suggestions.
            </p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="relative">
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 px-4 py-3 text-base pl-9"
                    placeholder="Your name"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">👤</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 px-4 py-3 text-base pl-9"
                    placeholder="Your email"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">📧</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Feedback</label>
                <div className="relative">
                  <textarea
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 px-4 py-3 text-base"
                    placeholder="Share your thoughts..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">📝</span>
                  </div>
                </div>
              </div>
              {loading ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-violet-600 text-white py-2 px-4 rounded-md"
                >
                  <span className="animate-spin">⏳</span> Sending...
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