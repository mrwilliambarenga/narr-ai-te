import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "narr-ai-te-28031.firebaseapp.com",
  projectId: "narr-ai-te-28031",
  // storageBucket: "narr-ai-te-28031.appspot.com",
  // messagingSenderId: "909080325939",
  appId: "1:909080325939:web:76a98322dfeabb8b12d846",
  // measurementId: "G-KL16SPNS0Q"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

export { app, functions };
