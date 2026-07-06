/**
 * Firebase configuration
 *
 * Replace the placeholder values below with your Firebase project config.
 * Firebase Console → Project Settings → Your apps → Web app → Config
 */
const firebaseConfig = {
  apiKey: "AIzaSyDPZkAnPXwDT5d4MZ6fzemYt7idSA52OX4",
  authDomain: "fitnessparkgym-2c477.firebaseapp.com",
  projectId: "fitnessparkgym-2c477",
  storageBucket: "fitnessparkgym-2c477.firebasestorage.app",
  messagingSenderId: "640041928036",
  appId: "1:640041928036:web:b5c8d8323647bbb1146671",
  measurementId: "G-CQ83QQF2BK"
};

const FIREBASE_CONFIGURED =
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

if (FIREBASE_CONFIGURED) {
  firebase.initializeApp(firebaseConfig);
}

const auth = FIREBASE_CONFIGURED ? firebase.auth() : null;
const db = FIREBASE_CONFIGURED ? firebase.firestore() : null;
