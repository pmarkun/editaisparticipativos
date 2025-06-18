
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from '../env';

let app: FirebaseApp | undefined = undefined;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

app = initializeApp(firebaseConfig);

if (app) {
    authInstance = getAuth(app);
    console.log("Firebase Auth service retrieved successfully.");
    dbInstance = getFirestore(app);
    console.log("Firebase Firestore service retrieved successfully.");
}

export { app, dbInstance as db, authInstance as auth };
