// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjPK52Pbysa2qGefiSPbE1KA4HdWuG6Ro",
  authDomain: "estudos-concursos.firebaseapp.com",
  projectId: "estudos-concursos",
  storageBucket: "estudos-concursos.firebasestorage.app",
  messagingSenderId: "673626550366",
  appId: "1:673626550366:web:834665232a7e9f730b84cf",
  measurementId: "G-SCSKLVC9D6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

