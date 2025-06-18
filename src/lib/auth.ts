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
  // Proponent-specific fields (only populated if role is 'proponent')
  phone?: string;
  sex?: string;
  race?: string;
  address?: string;
  areaOfExpertise?: string;
  hasEntity?: boolean;
  entities?: Array<{
    name: string;
    cnpj: string;
    municipalCode?: string;
    address: string;
  }>;
}

export interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  hasEntity: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
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
              // Proponent-specific fields
              phone: data.phone,
              sex: data.sex,
              race: data.race,
              address: data.address,
              areaOfExpertise: data.areaOfExpertise,
              hasEntity: data.hasEntity || false,
              entities: data.entities || [],
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userData,
    loading,
    isAdmin: userData?.role === 'admin',
    hasEntity: userData?.hasEntity || false,
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
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().hasEntity || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking user entity:', error);
    return false;
  }
}
