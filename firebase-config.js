// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZ1zgykQOQq3wMnW6rF11t6eNfeqeMlco",
  authDomain: "motos-b1c0b.firebaseapp.com",
  projectId: "motos-b1c0b",
  storageBucket: "motos-b1c0b.firebasestorage.app",
  messagingSenderId: "338886551793",
  appId: "1:338886551793:web:6739e4125632a7f571a150",
  measurementId: "G-V2XNEDED4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);