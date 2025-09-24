// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoW1sWRnxU90k29p2-d3J_l7TXTIXbwc4",
  authDomain: "thigha-e3340.firebaseapp.com", // Updated to match your Firebase project
  projectId: "thigha-e3340", // Updated to match your Firebase project
  storageBucket: "thigha-e3340.firebasestorage.app", // Updated to match your Firebase project
  messagingSenderId: "910321243694",
  appId: "1:910321243694:web:4aca8a6cd18ca70cfef1bf",
  measurementId: "G-76C8W4RX49"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app); // export a single auth instance

export { app, auth, messaging, getToken, onMessage };