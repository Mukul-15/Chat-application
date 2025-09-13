# Zentalk - Custom Authentication Chat Application

A real-time private chat application built with React and Firebase. Features custom user authentication, private chat requests, and real-time messaging using Firestore.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Firebase Firestore (No Firebase Auth)
- **Authentication:** Custom credentials stored in Firestore
- **Database:** Firestore for data storage
- **Real-time:** Firestore real-time listeners

## Features

- 🔐 Custom user authentication with email/password
- 👥 User search and private chat request system
- 💬 Real-time messaging with Firestore
- 📱 Responsive design with Tailwind CSS
- 🔒 Private chat flow: search → send request → accept → create chat
- ⚡ Fast development with Vite and hot reload
- 🔒 Password hashing for security

## Firebase Collections

### Users Collection
- `email`: User email (unique)
- `password`: Hashed password
- `name`: Display name
- `userCode`: Unique user identifier (e.g., USER_ABC123)
- `photoURL`: Profile picture URL
- `createdAt`: Account creation timestamp
- `lastSeen`: Last activity timestamp

### Chat Requests Collection
- `fromUser`: Sender's user ID
- `toUser`: Recipient's user ID
- `status`: 'pending', 'accepted', or 'rejected'
- `createdAt`: Request timestamp

### Chats Collection
- `members`: Array of user IDs
- `createdAt`: Chat creation timestamp

### Messages Collection
- `chatId`: Reference to chat document
- `senderId`: Sender's user ID
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
   - Make sure your Firebase project has Firestore enabled
   - No Firebase Authentication needed - we use custom auth

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
    
    // Allow read/write for all users (since we're using custom auth)
    // In production, implement proper authentication checks
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Authentication Flow

1. **Registration:**
   - User provides name, email, password
   - Password is hashed and stored in Firestore
   - User data is saved to `users` collection
   - User is automatically logged in

2. **Login:**
   - User provides email and password
   - System searches for user by email in Firestore
   - Password is verified against stored hash
   - User data is loaded and stored in localStorage

3. **Session Management:**
   - User data is stored in localStorage
   - App checks localStorage on startup
   - Logout clears localStorage

## Project Structure

```
client/
├── src/
│   ├── firebase/
│   │   ├── config.js          # Firebase configuration
│   │   ├── auth.js            # Custom authentication functions
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

## Security Notes

- **Password Hashing:** Currently uses a simple hash function for demo purposes
- **Production:** Use bcrypt or similar for proper password hashing
- **Validation:** Add proper input validation and sanitization
- **Rate Limiting:** Implement rate limiting for login attempts
- **HTTPS:** Ensure all communication is over HTTPS in production

## Features Implemented

- ✅ Custom user registration and login
- ✅ Password hashing
- ✅ User search functionality
- ✅ Chat request system
- ✅ Real-time messaging
- ✅ Responsive UI
- ✅ Error handling
- ✅ Loading states
- ✅ Session persistence

## Development Notes

- All real-time functionality is handled by Firestore listeners
- No backend server required - everything runs on Firebase
- Authentication is managed by custom logic with Firestore
- Messages are stored in Firestore and synced in real-time
- User sessions are managed via localStorage