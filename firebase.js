// Firebase setup (CDN modules, no build step needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyALDyTfCmcoPnrEJu3m3Z3pto84U-xNtUA",
  authDomain: "gu-tech-lms.firebaseapp.com",
  databaseURL: "https://gu-tech-lms-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gu-tech-lms",
  storageBucket: "gu-tech-lms.firebasestorage.app",
  messagingSenderId: "1044352280657",
  appId: "1:1044352280657:web:90682920bac81629b57070",
  measurementId: "G-HC6YE8HJMD",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Analytics only works in supported browsers
isSupported().then((ok) => { if (ok) getAnalytics(app); }).catch(() => {});
