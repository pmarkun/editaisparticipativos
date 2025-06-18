
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

console.log("Attempting to configure Firebase...");

const requiredEnvVars: string[] = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  // You can add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET and NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  // if they are strictly required for your app's core functionality to start.
  // For now, focusing on the ones most likely to cause `auth/configuration-not-found`.
];

let firebaseConfigIsValid = true;
console.log("Checking for required Firebase environment variables...");

// Log all process.env keys starting with NEXT_PUBLIC_FIREBASE_ for debugging
const foundFirebaseEnvVars: Record<string, string | undefined> = {};
for (const key in process.env) {
  if (key.startsWith('NEXT_PUBLIC_FIREBASE_')) {
    foundFirebaseEnvVars[key] = process.env[key];
  }
}
console.log("Found NEXT_PUBLIC_FIREBASE_ environment variables in process.env:", foundFirebaseEnvVars);


for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(
      `Firebase config error: Missing environment variable ${envVar}. ` +
      `Please ensure it's set in your .env.local file (located in the project root), ` +
      `that the variable name is correct, and that the development server was restarted after changes.`
    );
    firebaseConfigIsValid = false;
  } else {
    // console.log(`Found environment variable: ${envVar}`); // Optional: log if found
  }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Optional, but good to have
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Optional
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined = undefined;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (firebaseConfigIsValid) {
  console.log("Firebase environment variables seem present. Attempting to initialize Firebase app...");
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully.");
    } catch (e) {
      console.error("Firebase initialization error (initializeApp failed):", e);
      firebaseConfigIsValid = false;
    }
  } else {
    app = getApp();
    console.log("Existing Firebase app retrieved.");
  }

  if (app) {
    try {
      authInstance = getAuth(app);
      console.log("Firebase Auth service retrieved successfully.");
      dbInstance = getFirestore(app);
      console.log("Firebase Firestore service retrieved successfully.");
    } catch (e) {
        console.error("Error getting Firebase services (Auth/Firestore) after app initialization:", e);
        firebaseConfigIsValid = false;
    }
  } else if(firebaseConfigIsValid) {
    console.error("Firebase app is undefined after initialization/retrieval attempt, though config was initially deemed valid.");
    firebaseConfigIsValid = false;
  }
} else {
  console.error("Firebase configuration is invalid due to missing environment variables. Firebase will not be initialized.");
}

if (!firebaseConfigIsValid && firebaseConfig.apiKey === undefined && Object.keys(foundFirebaseEnvVars).length === 0) {
    console.warn(
    "Critical Firebase config error: No Firebase environment variables (e.g., NEXT_PUBLIC_FIREBASE_API_KEY) were found in process.env. " +
    "This strongly suggests an issue with the .env.local file (location, naming, or server restart). " +
    "Firebase WILL NOT WORK."
  );
} else if (!firebaseConfigIsValid) {
   console.warn(
    "Firebase was not properly initialized due to configuration issues or errors during service retrieval. " +
    "Firebase-dependent functionalities (Auth, Firestore) may not work. " +
    "Please check your .env.local file, Firebase project setup, and restart the development server."
  );
}


export { app, dbInstance as db, authInstance as auth };
