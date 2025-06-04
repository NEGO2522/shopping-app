import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const actionCodeSettings = {
  url: window.location.origin + '/login',
  handleCodeInApp: true,
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user data exists in database
  const checkUserExists = async (uid) => {
    try {
      const userRef = ref(db, 'users/' + uid);
      const snapshot = await get(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = async (user) => {
    const userExists = await checkUserExists(user.uid);
    if (userExists) {
      navigate('/home');
    } else {
      navigate('/user-details');
    }
  };

  // Check if the user is completing email sign in
  React.useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailFromStorage = window.localStorage.getItem('emailForSignIn');
      if (!emailFromStorage) {
        emailFromStorage = window.prompt('Please provide your email for confirmation');
      }

      signInWithEmailLink(auth, emailFromStorage, window.location.href)
        .then(async (result) => {
          window.localStorage.removeItem('emailForSignIn');
          await handleAuthSuccess(result.user);
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  }, [navigate]);

  const handlePasswordlessSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (error) {
      console.error("Error during passwordless sign in:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(result.user);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200 to-violet-300 opacity-20 blur-3xl transform rotate-12" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 opacity-20 blur-3xl transform -rotate-12" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 mb-2">
            Campus Crush
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back to your campus community
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl space-y-8 transform hover:scale-[1.01] transition-all duration-300">
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Check your email!</h2>
              <p className="text-gray-600">
                We've sent a Email link to <span className="font-medium text-violet-600">{email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in your email to sign in to your account.
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in with email</h2>
                <p className="text-gray-600">
                  Use your college email for verification
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordlessSignIn} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    College Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="yourname@college.edu"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 font-medium transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Email Link"}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 font-medium transform hover:scale-[1.02] transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          By signing in, you agree to our{" "}
          <a href="#" className="font-medium text-violet-600 hover:text-violet-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-violet-600 hover:text-violet-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
