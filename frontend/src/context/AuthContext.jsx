import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  isFirebaseConfigured 
} from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

const LOCAL_STORAGE_USER_KEY = 'marine_ai_auth_user';
const LOCAL_STORAGE_DB_KEY = 'marine_ai_users_db';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync / Listen to Auth State
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setCurrentUser(firebaseUser);
          try {
            // Fetch non-sensitive user profile from users/{uid}
            const userRef = doc(db, 'users', firebaseUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              setUserProfile(snap.data());
            } else {
              // Create document if doesn't exist
              const initialProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'Mariner',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                preferredLanguage: localStorage.getItem('marine_ai_lang') || 'EN'
              };
              await setDoc(userRef, initialProfile, { merge: true });
              setUserProfile(initialProfile);
            }
          } catch (err) {
            console.warn('[Auth] Error fetching Firestore user profile:', err);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
    } else {
      // Local Auth Simulation when Firebase keys are not in .env
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (saved) {
          const user = JSON.parse(saved);
          setCurrentUser(user);
          setUserProfile(user);
        }
      } catch (e) {
        // Fallback
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 1. Signup Function
  const signup = async (email, password, displayName = 'Mariner') => {
    if (isFirebaseConfigured && auth) {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCred.user, { displayName });
      }

      // Store in Firestore users/{uid} with non-sensitive fields only
      const profileData = {
        uid: userCred.user.uid,
        email: userCred.user.email,
        displayName: displayName || userCred.user.displayName || 'Mariner',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferredLanguage: localStorage.getItem('marine_ai_lang') || 'EN'
      };

      try {
        const userRef = doc(db, 'users', userCred.user.uid);
        await setDoc(userRef, profileData);
        setUserProfile(profileData);
      } catch (err) {
        console.warn('[Auth] Firestore user profile creation warning:', err);
      }

      setCurrentUser(userCred.user);
      return userCred.user;
    } else {
      // Local development simulation
      const uid = 'loc-' + Math.random().toString(36).substr(2, 9);
      const newUser = {
        uid,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferredLanguage: localStorage.getItem('marine_ai_lang') || 'EN'
      };

      // Save user to simulated DB
      try {
        const dbUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DB_KEY) || '{}');
        dbUsers[email] = { ...newUser, passwordHash: 'local-hash' }; // Never store raw password
        localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(dbUsers));
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      } catch (e) {
        // Fallback
      }

      setCurrentUser(newUser);
      setUserProfile(newUser);
      return newUser;
    }
  };

  // 2. Login Function
  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      // Update lastLogin timestamp in Firestore
      try {
        const userRef = doc(db, 'users', userCred.user.uid);
        await updateDoc(userRef, { lastLogin: new Date().toISOString() });
      } catch (e) {
        // Silent error
      }
      setCurrentUser(userCred.user);
      return userCred.user;
    } else {
      // Local simulation
      const dbUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DB_KEY) || '{}');
      const user = dbUsers[email] || {
        uid: 'demo-' + Math.random().toString(36).substr(2, 6),
        email,
        displayName: email.split('@')[0] || 'Mariner',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferredLanguage: localStorage.getItem('marine_ai_lang') || 'EN'
      };

      user.lastLogin = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      setCurrentUser(user);
      setUserProfile(user);
      return user;
    }
  };

  // 3. Logout Function
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  // 4. Password Reset Function
  const resetPassword = async (email) => {
    if (isFirebaseConfigured && auth) {
      return sendPasswordResetEmail(auth, email);
    } else {
      console.log(`[Auth Mock] Password reset link sent to: ${email}`);
      return true;
    }
  };

  // 5. Google Sign In Function
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Ensure user profile in Firestore users/{uid}
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const updates = {
            lastLogin: new Date().toISOString()
          };
          if (user.photoURL) updates.photoURL = user.photoURL;
          if (user.displayName) updates.displayName = user.displayName;
          await updateDoc(userRef, updates);
          setUserProfile({ ...snap.data(), ...updates });
        } else {
          const initialProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Mariner',
            photoURL: user.photoURL || null,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            preferredLanguage: localStorage.getItem('marine_ai_lang') || 'EN'
          };
          await setDoc(userRef, initialProfile, { merge: true });
          setUserProfile(initialProfile);
        }
      } catch (err) {
        console.warn('[Auth] Firestore user profile sync on Google sign in:', err);
      }

      setCurrentUser(user);
      return user;
    } else {
      // Local simulation fallback for development
      const mockGoogleUser = {
        uid: 'google-' + Math.random().toString(36).substr(2, 8),
        email: 'google.mariner@marineai.gov',
        displayName: 'Captain Mariner (Google)',
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferredLanguage: localStorage.getItem('marine_ai_lang') || 'EN'
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockGoogleUser));
      } catch (e) {
        // ignore
      }

      setCurrentUser(mockGoogleUser);
      setUserProfile(mockGoogleUser);
      return mockGoogleUser;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        isFirebaseConfigured
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
