// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsI8j13y9SQhvf9wTLvHZ_v631-Ayx0N4",
  authDomain: "ragg-82096.firebaseapp.com",
  projectId: "ragg-82096",
  storageBucket: "ragg-82096.appspot.com",
  messagingSenderId: "405586854115",
  appId: "1:405586854115:web:8a7f581c882e4a804645d6",
  measurementId: "G-JN0ZCMJSHJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
export { db }