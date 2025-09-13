import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';

// Collections
const USERS_COLLECTION = 'users';
const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';
const REQUESTS_COLLECTION = 'chatRequests';

// User operations
export const getUser = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Chat request operations
export const createChatRequest = async (fromUserId, toUserId) => {
  try {
    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), {
      fromUser: fromUserId,
      toUser: toUserId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat request:', error);
    throw error;
  }
};

export const getChatRequests = async (userId) => {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('toUser', '==', userId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting chat requests:', error);
    throw error;
  }
};

export const acceptChatRequest = async (requestId) => {
  try {
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, { status: 'accepted' });
    
    // Create a new chat
    const chatRef = await addDoc(collection(db, CHATS_COLLECTION), {
      createdAt: serverTimestamp(),
      members: []
    });
    
    return chatRef.id;
  } catch (error) {
    console.error('Error accepting chat request:', error);
    throw error;
  }
};

// Chat operations
export const createChat = async (memberIds) => {
  try {
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), {
      members: memberIds,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getUserChats = async (userId) => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('members', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Message operations
export const sendMessage = async (chatId, senderId, text) => {
  try {
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId,
      senderId,
      text,
      timestamp: serverTimestamp(),
      isRead: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToChatMessages = (chatId, callback) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    callback(messages);
  });
};

export const subscribeToUserChats = (userId, callback) => {
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('members', 'array-contains', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const chats = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    callback(chats);
  });
};
