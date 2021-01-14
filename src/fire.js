import firebase from "firebase";
const { REACT_APP_FIREBASE_APIKEY } = process.env;

const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_APIKEY,
  authDomain: "solid-mantra-301604.firebaseapp.com",
  projectId: "solid-mantra-301604",
  storageBucket: "solid-mantra-301604.appspot.com",
  messagingSenderId: "606963454972",
  appId: "1:606963454972:web:e31f52a89bf1edaf329879",
  measurementId: "G-PN1MMGDFWQ",
};

try {
  firebase.initializeApp(firebaseConfig);
} catch (err) {
  if (!/already exists/.test(err.message)) {
    console.error("Firebase initialization error", err.stack);
  }
}

const fire = firebase;
export default fire;
