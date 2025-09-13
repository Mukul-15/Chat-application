# Zentalk Full Stack Starter

This project is a starter full-stack real-time private chat application.
- Frontend: React + Vite + Tailwind (TypeScript)
- Backend: Node.js + Express + Socket.io + Sequelize (MySQL)
- Private chat flow: search -> send request -> accept -> create chat

Instructions:
1. Copy `.env.example` to `.env` and fill values.
2. Run MySQL and execute `server/db/init.sql` or let Sequelize sync.
3. Start backend: cd server && npm install && npm run dev
4. Start frontend: cd client && npm install && npm run dev
