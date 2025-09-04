// Firebase configuration for Admin Panel
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAE9MEa5e5F1keoaR8uiMXiELSozwMXH1Y",
  authDomain: "global-edutech-learn.firebaseapp.com",
  projectId: "global-edutech-learn",
  storageBucket: "global-edutech-learn.firebasestorage.app",
  messagingSenderId: "730614640010",
  appId: "1:730614640010:web:f8f9d177e546a3aa24ac73",
  measurementId: "G-J5H97TFP8S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
