import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Função para obter a configuração do Firebase
function getFirebaseConfig() {
  if (typeof window === 'undefined') {
    // No servidor, retorna uma configuração vazia para evitar erros
    return null;
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

// Inicialização lazy do Firebase
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

function initializeFirebase() {
  if (typeof window === 'undefined') {
    // Não inicializar no servidor
    return { app: null, auth: null, db: null };
  }

  if (firebaseApp && firebaseAuth && firebaseDb) {
    // Já inicializado
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
  }

  const firebaseConfig = getFirebaseConfig();
  
  if (!firebaseConfig) {
    console.error('Firebase config not available');
    return { app: null, auth: null, db: null };
  }

  // Check if any required config is missing
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
  }

  try {
    // Initialize Firebase only if it hasn't been initialized already
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // Initialize Firebase Authentication and get a reference to the service
    firebaseAuth = getAuth(firebaseApp);

    // Initialize Cloud Firestore and get a reference to the service
    firebaseDb = getFirestore(firebaseApp);

    console.log('[Firebase] Initialized successfully');
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    return { app: null, auth: null, db: null };
  }
}

// Getters que inicializam lazy
export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (!firebaseAuth) {
    initializeFirebase();
  }
  return firebaseAuth;
}

export function getFirebaseDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (!firebaseDb) {
    initializeFirebase();
  }
  return firebaseDb;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp;
}

// Exports para compatibilidade
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
export const db = typeof window !== 'undefined' ? getFirebaseDb() : null;

export default typeof window !== 'undefined' ? getFirebaseApp() : null;