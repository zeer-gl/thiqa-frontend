// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config - using direct values to avoid Google Cloud dependencies
const firebaseConfig = {
  apiKey: "AIzaSyBTPeXYbHB1Z4K3UK8VW79xgpyc28kG-CI",
  authDomain: "thigha-e3340.firebaseapp.com",
  projectId: "thigha-e3340",
  storageBucket: "thigha-e3340.firebasestorage.app",
  messagingSenderId: "880282854095",
  appId: "1:880282854095:web:c2d49a97e9c9149c8ccdba",
  measurementId: "G-G0P1GX5Y2X"
};

console.log('🔍 Firebase Config Debug:', firebaseConfig);

const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const messaging = getMessaging(app);

// Configure Google Auth Provider with Firebase-only settings
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, messaging, googleProvider, getToken, onMessage };
