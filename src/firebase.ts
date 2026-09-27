import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

// This is your real, correct config
const firebaseConfig = {
  apiKey: "AIzaSyBnYyxARVJCtiXoqsk-B9Cx1zlXcdq2HkI",
  authDomain: "citizen-legal-buddy.firebaseapp.com",
  projectId: "citizen-legal-buddy",
  storageBucket: "citizen-legal-buddy.firebasestorage.app",
  messagingSenderId: "620075232828",
  appId: "1:620075232828:web:de3d395463f4367c305d39",
  measurementId: "G-FHNP4HZD2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable debug logging for Firestore
setLogLevel('debug');

export { app, auth, db };