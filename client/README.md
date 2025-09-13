# Zentalk - Firebase Chat Application

A real-time private chat application built with React and Firebase. Features user authentication, private chat requests, and real-time messaging.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore, Realtime Database)
- **Authentication:** Firebase Auth
- **Database:** Firestore for data storage
- **Real-time:** Firestore real-time listeners

## Features

- 🔐 Secure user authentication with Firebase Auth
- 👥 User search and private chat request system
- 💬 Real-time messaging with Firestore
- 📱 Responsive design with Tailwind CSS
- 🔒 Private chat flow: search → send request → accept → create chat
- ⚡ Fast development with Vite and hot reload

## Firebase Collections

### Users Collection
- `uid`: Firebase Auth UID
- `email`: User email
- `name`: Display name
- `userCode`: Unique user identifier
- `photoURL`: Profile picture URL
- `createdAt`: Account creation timestamp
- `lastSeen`: Last activity timestamp

### Chat Requests Collection
- `fromUser`: Sender's UID
- `toUser`: Recipient's UID
- `status`: 'pending', 'accepted', or 'rejected'
- `createdAt`: Request timestamp

### Chats Collection
- `members`: Array of user UIDs
- `createdAt`: Chat creation timestamp

### Messages Collection
- `chatId`: Reference to chat document
- `senderId`: Sender's UID
- `text`: Message content
- `timestamp`: Message timestamp
- `isRead`: Read status

## Getting Started

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Firebase Setup:**
   - The Firebase configuration is already set up in `src/firebase/config.js`
   - Make sure your Firebase project has Authentication and Firestore enabled
   - Enable Email/Password authentication in Firebase Console

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Firebase Security Rules

Make sure to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat requests
    match /chatRequests/{requestId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.fromUser || 
         request.auth.uid == resource.data.toUser);
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.members;
    }
  }
}
```

## Project Structure

```
client/
├── src/
│   ├── firebase/
│   │   ├── config.js          # Firebase configuration
│   │   ├── auth.js            # Authentication functions
│   │   └── firestore.js       # Firestore operations
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── pages/
│   │   ├── Login.tsx          # Login page
│   │   ├── Register.tsx       # Registration page
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   └── ChatRoom.tsx       # Chat interface
│   └── App.tsx                # Main app component
├── package.json
└── README.md
```

## Features Implemented

- ✅ User registration and login
- ✅ User search functionality
- ✅ Chat request system
- ✅ Real-time messaging
- ✅ Responsive UI
- ✅ Error handling
- ✅ Loading states

## Development Notes

- All real-time functionality is handled by Firestore listeners
- No backend server required - everything runs on Firebase
- Authentication state is managed by Firebase Auth
- Messages are stored in Firestore and synced in real-time
