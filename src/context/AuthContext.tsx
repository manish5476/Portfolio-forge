import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  loginWithGoogle as firebaseLoginGoogle,
  loginWithGithub as firebaseLoginGithub,
  logoutUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserAccount, PortfolioData } from '../types';

interface AuthContextType {
  currentUser: UserAccount | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signUpWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    username: string
  ) => Promise<UserAccount>;
  signInWithEmail: (email: string, pass: string, rememberMe?: boolean) => Promise<UserAccount>;
  signInWithGoogle: (customUsername?: string) => Promise<UserAccount>;
  signInWithGithub: (customUsername?: string) => Promise<UserAccount>;
  signInWithLinkedIn: (email: string, displayName: string, customUsername?: string) => Promise<UserAccount>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  logout: () => Promise<void>;
  claimUsername: (newUsername: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Helper to construct seed portfolio for new authenticated user
  const createDefaultPortfolioForUser = (
    uid: string,
    username: string,
    email: string,
    displayName: string,
    photoURL?: string
  ): PortfolioData => {
    return {
      id: username,
      ownerId: uid,
      username: username.toLowerCase().trim(),
      createdBy: uid,
      updatedBy: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        displayName: displayName || username,
        tagline: 'Software Engineer & Product Creator',
        bio: 'Passionate developer crafting modern, high-performance web applications and software systems.',
        avatarUrl: photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        location: 'San Francisco, CA',
        resumeUrl: '',
        githubUsername: username,
        availability: 'open_to_work',
        verified: true,
        theme: 'dark',
        accentColor: '#6366f1',
        socialLinks: {
          github: `https://github.com/${username}`,
          email: email,
        },
      },
      projects: [
        {
          id: `proj_${Date.now()}_1`,
          title: 'SaaS Analytics Dashboard',
          description: 'A high-performance real-time telemetry monitoring dashboard built with React and TypeScript.',
          source: 'manual',
          techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
          featured: true,
        },
      ],
      achievements: [
        {
          id: `ach_${Date.now()}_1`,
          title: 'Registered Developer',
          description: 'Verified PortfolioForge SaaS Platform Creator.',
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          icon: 'trophy',
        },
      ],
    };
  };

  // Helper to sanitize & reserve unique username handle
  const registerUsernameAndPortfolio = async (
    uid: string,
    rawUsername: string,
    email: string,
    displayName: string,
    photoURL?: string,
    provider: 'password' | 'google' | 'github' | 'linkedin' = 'password'
  ): Promise<UserAccount> => {
    const handle = rawUsername.toLowerCase().trim().replace(/[^a-z0-9_\-]/g, '');
    if (!handle || handle.length < 3) {
      throw new Error('Username handle must be at least 3 alphanumeric characters.');
    }

    // 1. Check if username handle is already claimed
    const usernameDocRef = doc(db, 'usernames', handle);
    const usernameSnap = await getDoc(usernameDocRef);
    if (usernameSnap.exists() && usernameSnap.data()?.uid !== uid) {
      throw new Error(`Username handle "${handle}" is already claimed. Please choose another.`);
    }

    // 2. Write username claim document
    await setDoc(usernameDocRef, {
      username: handle,
      uid: uid,
      createdAt: serverTimestamp(),
    });

    // 3. User account document
    const userAccount: UserAccount = {
      uid,
      id: uid,
      username: handle,
      email,
      displayName: displayName || handle,
      photoURL: photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${handle}`,
      emailVerified: auth.currentUser?.emailVerified || false,
      provider,
      createdAt: new Date().toISOString(),
    };

    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, userAccount, { merge: true });

    // 4. Ensure portfolio exists for handle
    const portfolioDocRef = doc(db, 'portfolios', handle);
    const portfolioSnap = await getDoc(portfolioDocRef);
    if (!portfolioSnap.exists()) {
      const defaultPortfolio = createDefaultPortfolioForUser(uid, handle, email, displayName, photoURL);
      await setDoc(portfolioDocRef, defaultPortfolio);

      // Sync to local express server
      fetch(`/api/portfolio/${handle}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultPortfolio),
      }).catch((e) => console.warn('Server sync warning:', e));
    }

    return userAccount;
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', fUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const uData = userSnap.data() as UserAccount;
            setCurrentUser(uData);
          } else {
            // Auto-provision initial handle from email or display name
            const derivedHandle = (fUser.email?.split('@')[0] || `user_${fUser.uid.substring(0, 6)}`)
              .toLowerCase()
              .replace(/[^a-z0-9_\-]/g, '');

            const uAccount = await registerUsernameAndPortfolio(
              fUser.uid,
              derivedHandle,
              fUser.email || '',
              fUser.displayName || derivedHandle,
              fUser.photoURL || undefined,
              (fUser.providerData[0]?.providerId.includes('google')
                ? 'google'
                : fUser.providerData[0]?.providerId.includes('github')
                ? 'github'
                : 'password') as any
            );
            setCurrentUser(uAccount);
          }
        } catch (err: any) {
          console.error('Error loading authenticated user data:', err);
          setError(err.message || 'Failed to resolve user account details.');
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email + Password Sign Up
  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    username: string
  ): Promise<UserAccount> => {
    setError(null);
    try {
      const handle = username.toLowerCase().trim().replace(/[^a-z0-9_\-]/g, '');
      // Pre-check handle availability in Firestore
      const usernameSnap = await getDoc(doc(db, 'usernames', handle));
      if (usernameSnap.exists()) {
        throw new Error(`Username handle "${handle}" is already registered.`);
      }

      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      // Optional: send email verification
      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Verification email send failed:', e);
      }

      const userAccount = await registerUsernameAndPortfolio(
        cred.user.uid,
        handle,
        email,
        displayName,
        undefined,
        'password'
      );
      setCurrentUser(userAccount);
      return userAccount;
    } catch (err: any) {
      setError(err.message || 'Sign up failed.');
      throw err;
    }
  };

  // Email + Password Sign In
  const signInWithEmail = async (email: string, pass: string, rememberMe = true): Promise<UserAccount> => {
    setError(null);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userSnap = await getDoc(doc(db, 'users', cred.user.uid));

      if (userSnap.exists()) {
        const uAccount = userSnap.data() as UserAccount;
        setCurrentUser(uAccount);
        return uAccount;
      } else {
        const derivedHandle = (email.split('@')[0] || `user_${cred.user.uid.substring(0, 6)}`)
          .toLowerCase()
          .replace(/[^a-z0-9_\-]/g, '');
        const uAccount = await registerUsernameAndPortfolio(
          cred.user.uid,
          derivedHandle,
          email,
          cred.user.displayName || derivedHandle,
          undefined,
          'password'
        );
        setCurrentUser(uAccount);
        return uAccount;
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      throw err;
    }
  };

  // Google Login
  const signInWithGoogle = async (customUsername?: string): Promise<UserAccount> => {
    setError(null);
    try {
      const fUser = await firebaseLoginGoogle();
      const userSnap = await getDoc(doc(db, 'users', fUser.uid));

      if (userSnap.exists()) {
        const uAccount = userSnap.data() as UserAccount;
        setCurrentUser(uAccount);
        return uAccount;
      } else {
        const handle = (customUsername || fUser.email?.split('@')[0] || `user_${fUser.uid.substring(0, 6)}`)
          .toLowerCase()
          .replace(/[^a-z0-9_\-]/g, '');

        const uAccount = await registerUsernameAndPortfolio(
          fUser.uid,
          handle,
          fUser.email || '',
          fUser.displayName || handle,
          fUser.photoURL || undefined,
          'google'
        );
        setCurrentUser(uAccount);
        return uAccount;
      }
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
      throw err;
    }
  };

  // GitHub Login
  const signInWithGithub = async (customUsername?: string): Promise<UserAccount> => {
    setError(null);
    try {
      const fUser = await firebaseLoginGithub();
      const userSnap = await getDoc(doc(db, 'users', fUser.uid));

      if (userSnap.exists()) {
        const uAccount = userSnap.data() as UserAccount;
        setCurrentUser(uAccount);
        return uAccount;
      } else {
        const handle = (customUsername || fUser.email?.split('@')[0] || `user_${fUser.uid.substring(0, 6)}`)
          .toLowerCase()
          .replace(/[^a-z0-9_\-]/g, '');

        const uAccount = await registerUsernameAndPortfolio(
          fUser.uid,
          handle,
          fUser.email || '',
          fUser.displayName || handle,
          fUser.photoURL || undefined,
          'github'
        );
        setCurrentUser(uAccount);
        return uAccount;
      }
    } catch (err: any) {
      setError(err.message || 'GitHub sign in failed.');
      throw err;
    }
  };

  // LinkedIn / Mock Provider Fallback
  const signInWithLinkedIn = async (
    email: string,
    displayName: string,
    customUsername?: string
  ): Promise<UserAccount> => {
    setError(null);
    try {
      // Create or login via password/mock flow
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, email, 'linkedin_oauth_secret_123');
      } catch (e) {
        cred = await createUserWithEmailAndPassword(auth, email, 'linkedin_oauth_secret_123');
      }

      const handle = (customUsername || email.split('@')[0] || `linkedin_${cred.user.uid.substring(0, 6)}`)
        .toLowerCase()
        .replace(/[^a-z0-9_\-]/g, '');

      const uAccount = await registerUsernameAndPortfolio(
        cred.user.uid,
        handle,
        email,
        displayName,
        `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`,
        'linkedin'
      );
      setCurrentUser(uAccount);
      return uAccount;
    } catch (err: any) {
      setError(err.message || 'LinkedIn authentication failed.');
      throw err;
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
      throw err;
    }
  };

  // Send Email Verification Link
  const verifyEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (err: any) {
        setError(err.message || 'Failed to send email verification link.');
        throw err;
      }
    }
  };

  // Logout
  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed.');
    }
  };

  // Claim or Update Username Handle
  const claimUsername = async (newUsername: string): Promise<boolean> => {
    if (!currentUser || !auth.currentUser) return false;
    try {
      const handle = newUsername.toLowerCase().trim().replace(/[^a-z0-9_\-]/g, '');
      if (handle === currentUser.username) return true;

      // Check if taken
      const usernameSnap = await getDoc(doc(db, 'usernames', handle));
      if (usernameSnap.exists()) {
        throw new Error(`Username handle "${handle}" is already claimed.`);
      }

      // Re-register under new handle
      await registerUsernameAndPortfolio(
        auth.currentUser.uid,
        handle,
        currentUser.email,
        currentUser.displayName,
        currentUser.photoURL,
        currentUser.provider
      );

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to change username handle.');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        error,
        clearError,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInWithGithub,
        signInWithLinkedIn,
        resetPassword,
        verifyEmail,
        logout,
        claimUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
