// AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { User, sendEmailVerification } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  auth: typeof auth;
  sendVerificationEmail: () => Promise<void>;
  secureFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  auth,
  sendVerificationEmail: async () => {},
  secureFetch: async () => {
    throw new Error('secureFetch not implemented');
  },
});

const AUTH_TIMEOUT_MS = 15000; // 15 seconds for auth state to resolve

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const sendVerificationEmail = async () => {
    if (!auth || !auth.currentUser) return;
    
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  };

  const secureFetch = async (url: string, options: RequestInit = {}) => {
    if (!user) {
      console.error('User is not authenticated. Cannot perform fetch.');
      throw new Error('User is not authenticated');
    }

    const token = await user.getIdToken();
    const headers = new Headers(options.headers);
    headers.append('Authorization', `Bearer ${token}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth is not initialized. Setting isLoading to false.");
      setIsLoading(false);
      return;
    }

    // Set a timeout for auth state resolution
    const authTimeout = setTimeout(() => {
      if (isLoading) { // Only if still loading
        console.warn(`Authentication state did not resolve within ${AUTH_TIMEOUT_MS / 1000} seconds. Forcing isLoading to false.`);
        setIsLoading(false);
        // Potentially set user to null or handle as an error state if needed
        // setUser(null); 
      }
    }, AUTH_TIMEOUT_MS);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      clearTimeout(authTimeout); // Clear the timeout as auth state has resolved
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, isLoading, auth, sendVerificationEmail, secureFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);