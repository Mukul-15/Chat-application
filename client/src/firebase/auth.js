import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';
import { createUser, getUser } from './firestore';

// Generate a unique user code
const generateUserCode = () => {
  return 'USER_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Register a new user
export const registerUser = async (email, password, name) => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName: name });
    
    // Generate unique user code
    const userCode = generateUserCode();
    
    // Create user document in Firestore
    const userId = await createUser({
      uid: user.uid,
      email: user.email,
      name: name,
      userCode: userCode,
      photoURL: user.photoURL || null
    });
    
    return { user, userId, userCode };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in user
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    const userData = await getUser(user.uid);
    
    return { user, userData };
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out user:', error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get additional user data from Firestore
      const userData = await getUser(user.uid);
      callback({ user, userData });
    } else {
      callback(null);
    }
  });
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
