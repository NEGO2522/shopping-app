// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0r1tQCDEq0G8W0EN7mD9drea4cBFiEKs",
  authDomain: "campus-crush-cbfed.firebaseapp.com",
  databaseURL: "https://campus-crush-cbfed-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "campus-crush-cbfed",
  storageBucket: "campus-crush-cbfed.firebasestorage.app",
  messagingSenderId: "989715437143",
  appId: "1:989715437143:web:f59f4839e673ade72d7512",
  measurementId: "G-D8VMN3SJNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

export { app, analytics, database as db, auth };
