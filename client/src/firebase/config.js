// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCy1HxPMYH1lFI8kPmPPhM7kY8PVEsiUc",
  authDomain: "chat-application-f4dd0.firebaseapp.com",
  projectId: "chat-application-f4dd0",
  storageBucket: "chat-application-f4dd0.firebasestorage.app",
  messagingSenderId: "974231253194",
  appId: "1:974231253194:web:4e08e48749ce3725ab4433",
  measurementId: "G-P83J61DYPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const db = getFirestore(app);

export default app;
