import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy as firestoreOrderBy,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfile {
  id: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await logLoginAttempt(email, true);
    return userCredential.user;
  } catch (error) {
    await logLoginAttempt(email, false);
    throw error;
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function isUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;

  if (!user) return false;

  const profileRef = doc(db, 'user_profiles', user.uid);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    return false;
  }

  const profile = profileSnap.data();
  return profile?.role === 'admin';
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const profileRef = doc(db, 'user_profiles', userId);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    return null;
  }

  return {
    id: profileSnap.id,
    ...profileSnap.data()
  } as UserProfile;
}

export async function createUserProfile(userId: string, role: 'admin' | 'user' = 'user') {
  const profileRef = doc(db, 'user_profiles', userId);

  const profile = {
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await setDoc(profileRef, profile);

  return {
    id: userId,
    ...profile
  };
}

export async function logAdminAction(
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, any>
) {
  const user = auth.currentUser;

  if (!user) {
    console.log('Admin action:', action, entityType, entityId, details);
    return;
  }

  await addDoc(collection(db, 'admin_logs'), {
    user_id: user.uid,
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    details: details || null,
    ip_address: null,
    created_at: new Date().toISOString()
  });
}

export async function logLoginAttempt(email: string, success: boolean) {
  await addDoc(collection(db, 'login_attempts'), {
    email,
    success,
    ip_address: null,
    attempted_at: new Date().toISOString()
  });
}

export async function checkLoginAttempts(email: string): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const attemptsRef = collection(db, 'login_attempts');
  const q = query(
    attemptsRef,
    where('email', '==', email),
    where('success', '==', false),
    where('attempted_at', '>=', oneHourAgo)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
