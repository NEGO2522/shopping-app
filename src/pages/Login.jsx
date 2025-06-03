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

function LoginSignup() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log("Logged in successfully!", userCredential.user);
      await handleAuthSuccess(userCredential.user);
    } catch (error) {
      console.error("Error during login:", error.message);
      alert(error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      console.log("Signed up successfully!", userCredential.user);
      await handleAuthSuccess(userCredential.user);
    } catch (error) {
      console.error("Error during sign up:", error.message);
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in successful!", result.user);
      await handleAuthSuccess(result.user);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setError(error.message);
    }
  };

  const googleButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "0.75rem",
    marginTop: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    backgroundColor: "white",
    fontWeight: "600",
    fontSize: "1rem",
    color: "#444",
    transition: "background-color 0.3s ease",
  };

  const googleIconStyle = {
    width: "20px",
    height: "20px",
    marginRight: "0.75rem",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {isLogin ? (
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
              Login to CampusCrush
            </h2>

            {emailSent ? (
              <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                <p className="text-green-800">
                  Check your email! We've sent you a sign-in link to {email}
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordlessSignIn} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Sending..." : "Send Sign-in Link"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={googleButtonStyle}
              className="mt-4 hover:bg-gray-50"
            >
              <svg
                style={googleIconStyle}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611 20.083h-1.98v-.002H24v7.832h11.03c-1.188 3.57-4.73 6.114-8.999 6.114-5.4 0-9.79-4.395-9.79-9.81 0-5.416 4.39-9.81 9.79-9.81 2.63 0 4.998 1.078 6.678 2.83l5.426-5.426C34.1 10.023 29.45 8 24 8 14.835 8 7 15.828 7 25.004c0 9.177 7.835 17 17 17 9.02 0 16.728-6.324 16.728-16.11 0-1.09-.12-2.06-.117-2.81z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.69l6.556 4.813A11.947 11.947 0 0014 25.004c0 3.39 1.294 6.463 3.4 8.738l-.003.002-5.84 4.53a17.956 17.956 0 01-5.25-13.586c0-1.852.432-3.603 1.005-5.2z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 43c5.18 0 9.55-1.71 12.73-4.66l-6.06-4.68A11.798 11.798 0 0124 35.022c-4.12 0-7.61-2.757-8.84-6.474l-.004.001-6.48 5.006A17.91 17.91 0 0024 43z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083h-1.98v-.002H24v7.832h11.03c-.53 1.59-1.52 2.927-2.86 3.8l-.003-.002 6.06 4.68C40.522 33.732 44 29.22 44 25.004c0-1.09-.12-2.06-.117-2.81z"
                />
              </svg>
              Continue with Google
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="font-medium text-violet-600 hover:text-violet-500"
              >
                Sign up
              </button>
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
              Create an Account
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="signUpName"
                style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}
              >
                Full Name
              </label>
              <input
                id="signUpName"
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="signUpEmail"
                style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}
              >
                Email
              </label>
              <input
                id="signUpEmail"
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="signUpPassword"
                style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}
              >
                Password
              </label>
              <input
                id="signUpPassword"
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="signUpConfirmPassword"
                style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}
              >
                Confirm Password
              </label>
              <input
                id="signUpConfirmPassword"
                type="password"
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#4f46e5",
                color: "white",
                fontWeight: "600",
                fontSize: "1rem",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4338ca")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
            >
              Sign Up
            </button>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={googleButtonStyle}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              <svg
                style={googleIconStyle}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611 20.083h-1.98v-.002H24v7.832h11.03c-1.188 3.57-4.73 6.114-8.999 6.114-5.4 0-9.79-4.395-9.79-9.81 0-5.416 4.39-9.81 9.79-9.81 2.63 0 4.998 1.078 6.678 2.83l5.426-5.426C34.1 10.023 29.45 8 24 8 14.835 8 7 15.828 7 25.004c0 9.177 7.835 17 17 17 9.02 0 16.728-6.324 16.728-16.11 0-1.09-.12-2.06-.117-2.81z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.69l6.556 4.813A11.947 11.947 0 0014 25.004c0 3.39 1.294 6.463 3.4 8.738l-.003.002-5.84 4.53a17.956 17.956 0 01-5.25-13.586c0-1.852.432-3.603 1.005-5.2z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 43c5.18 0 9.55-1.71 12.73-4.66l-6.06-4.68A11.798 11.798 0 0124 35.022c-4.12 0-7.61-2.757-8.84-6.474l-.004.001-6.48 5.006A17.91 17.91 0 0024 43z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083h-1.98v-.002H24v7.832h11.03c-.53 1.59-1.52 2.927-2.86 3.8l-.003-.002 6.06 4.68C40.522 33.732 44 29.22 44 25.004c0-1.09-.12-2.06-.117-2.81z"
                />
              </svg>
              Continue with Google
            </button>

            <p style={{ marginTop: "1rem", textAlign: "center" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4f46e5",
                  cursor: "pointer",
                  fontWeight: "600",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginSignup;
