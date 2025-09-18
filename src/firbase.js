// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoW1sWRnxU90k29p2-d3J_l7TXTIXbwc4",
  authDomain: "thiqa-b344a.firebaseapp.com", // Keep this or consider custom domain
  projectId: "thiqa-b344a",
  storageBucket: "thiqa-b344a.firebasestorage.app",
  messagingSenderId: "910321243694",
  appId: "1:910321243694:web:4aca8a6cd18ca70cfef1bf",
  measurementId: "G-76C8W4RX49"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app); // export a single auth instance

export { app, auth, messaging, getToken, onMessage };