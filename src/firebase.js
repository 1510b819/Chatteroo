// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk5TpUvSS1F26Stcv6Zb0jEwVYS2wo9Gw",
  authDomain: "chatteroo-919e2.firebaseapp.com",
  projectId: "chatteroo-919e2",
  storageBucket: "chatteroo-919e2.firebasestorage.app",
  messagingSenderId: "914507393066",
  appId: "1:914507393066:web:3747221b339ba98a2abb53"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);