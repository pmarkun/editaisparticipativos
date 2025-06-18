
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const requiredEnvVars: string[] = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let firebaseConfigIsValid = true;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(
      `Firebase config error: Missing environment variable ${envVar}. ` +
      `Please ensure it's set in your .env.local file and the development server was restarted.`
    );
    firebaseConfigIsValid = false;
  }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined = undefined;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (firebaseConfigIsValid) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase initialization error:", e);
      firebaseConfigIsValid = false; // Mark as invalid if initializeApp itself fails
    }
  } else {
    app = getApp();
  }

  if (app) {
    try {
      authInstance = getAuth(app);
      dbInstance = getFirestore(app);
    } catch (e) {
        console.error("Error getting Firebase services (Auth/Firestore):", e);
        // This might happen if config is valid enough for initializeApp but not for getAuth/getFirestore
        firebaseConfigIsValid = false; 
    }
  } else if(firebaseConfigIsValid) { 
    // This case (config valid but app undefined after trying to init/get) should ideally not be reached if initializeApp worked or getApp found one.
    // But as a safeguard:
    console.error("Firebase app could not be initialized or retrieved, though config was initially deemed valid.");
    firebaseConfigIsValid = false;
  }

}

if (!firebaseConfigIsValid) {
  // Ensure instances are null if config is invalid or initialization failed
  app = undefined;
  authInstance = null;
  dbInstance = null;
  console.error(
    "Firebase was not properly initialized due to configuration issues or errors during service retrieval. " +
    "Firebase-dependent functionalities (Auth, Firestore) will not work. " +
    "Please check your .env.local file and Firebase project setup."
  );
}

export { app, dbInstance as db, authInstance as auth };
