"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/client';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'proponent';
  createdAt: Date;
}

export interface ProponentData {
  userId: string;
  // Basic info
  name: string;
  email: string;
  phone: string;
  cpf: string;
  // Additional info
  sex: string;
  race: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  areaOfExpertise: string;
  // Entity info
  hasEntity: boolean;
  entityName?: string;
  entityCnpj?: string;
  entityMunicipalCode?: string;
  entityAddress?: string;
  entityCity?: string;
  entityState?: string;
  entityZipCode?: string;
}

export interface AuthState {
  user: User | null;
  userData: UserData | null;
  proponentData: ProponentData | null;
  loading: boolean;
  isAdmin: boolean;
  hasEntity: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [proponentData, setProponentData] = useState<ProponentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              uid: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || '',
              email: data.email || firebaseUser.email || '',
              role: data.role || 'proponent',
              createdAt: data.createdAt?.toDate() || new Date(),
            });

            // If user is a proponent, fetch proponent data
            if (data.role === 'proponent') {
              const proponentDoc = await getDoc(doc(db, 'proponents', firebaseUser.uid));
              if (proponentDoc.exists()) {
                const proponentData = proponentDoc.data() as ProponentData;
                setProponentData(proponentData);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
        setProponentData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userData,
    proponentData,
    loading,
    isAdmin: userData?.role === 'admin',
    hasEntity: proponentData?.hasEntity || false,
  };
}

export async function checkUserRole(uid: string): Promise<'admin' | 'proponent' | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role || 'proponent';
    }
    return null;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
}

export async function checkUserHasEntity(uid: string): Promise<boolean> {
  try {
    const proponentDoc = await getDoc(doc(db, 'proponents', uid));
    if (proponentDoc.exists()) {
      return proponentDoc.data().hasEntity || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking user entity:', error);
    return false;
  }
}
