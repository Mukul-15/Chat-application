import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './config';

// Simple password hashing (in production, use a proper hashing library)
const hashPassword = (password) => {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

// Generate a unique user code
const generateUserCode = () => {
  return 'USER_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Check if email already exists
const checkEmailExists = async (email) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (email, password, name) => {
  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Generate unique user code
    const userCode = generateUserCode();
    
    // Hash password
    const hashedPassword = hashPassword(password);
    
    // Create user document in Firestore
    const userData = {
      email: email,
      password: hashedPassword,
      name: name,
      userCode: userCode,
      photoURL: null,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'users'), userData);
    
    return { 
      id: docRef.id, 
      ...userData,
      password: undefined // Don't return password
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in user
export const signInUser = async (email, password) => {
  try {
    // Find user by email
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Verify password
    const hashedPassword = hashPassword(password);
    if (userData.password !== hashedPassword) {
      throw new Error('Invalid password');
    }

    // Update last seen
    await updateDoc(doc(db, 'users', userDoc.id), {
      lastSeen: serverTimestamp()
    });

    return { 
      id: userDoc.id, 
      ...userData,
      password: undefined // Don't return password
    };
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

// Sign out user (just clear local storage)
export const signOutUser = async () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error signing out user:', error);
    throw error;
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user !== null;
};
