"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { doc, getDoc } from 'firebase/firestore';

interface AppUser {
  uid: string;
  name: string | null;
  email: string | null;
  avatarUrl?: string | null;
  role: 'proponent' | 'admin' | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aguardar um pouco para garantir que o Firebase foi inicializado
    const timer = setTimeout(() => {
      if (!auth) {
        console.error('[AuthContext] Firebase auth not initialized');
        setLoading(false);
        return;
      }

      try {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          
          if (firebaseUser) {
            let userRole: AppUser['role'] = null;
            try {
              if (db) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                  userRole = userDocSnap.data()?.role || 'proponent';
                }

                let displayName = firebaseUser.displayName;
                if (!displayName && userDocSnap.exists()) {
                  displayName = userDocSnap.data()?.name || firebaseUser.email;
                }

                setUser({
                  uid: firebaseUser.uid,
                  name: displayName,
                  email: firebaseUser.email,
                  avatarUrl: firebaseUser.photoURL,
                  role: userRole,
                });
              } else {
                // Fallback sem Firestore
                setUser({
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName || firebaseUser.email,
                  email: firebaseUser.email,
                  avatarUrl: firebaseUser.photoURL,
                  role: 'proponent',
                });
              }
            } catch (error) {
              console.error("Error fetching user role:", error);
              setUser({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email,
                email: firebaseUser.email,
                avatarUrl: firebaseUser.photoURL,
                role: 'proponent',
              });
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        // Cleanup function
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('[AuthContext] Error setting up auth listener:', error);
        setLoading(false);
      }
    }, 200); // Aguardar 200ms

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
