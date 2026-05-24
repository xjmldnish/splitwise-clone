# 💰 Splitwise Clone

A full-stack expense splitting web app inspired by Splitwise. Users can create groups, add expenses, and automatically track who owes whom.

🔗 **Live Demo:** https://splitwise-clone-lilac.vercel.app/
## Features

- 🔐 User authentication (register, login, JWT)
- 👥 Create groups and invite members by email
- 💸 Add expenses with automatic equal split calculation
- 📊 Real-time balance tracking per group
- 📱 Responsive design

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Axios

**Backend**
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt password hashing

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

## Running Locally

### Prerequisites
- Node.js
- PostgreSQL

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Add your DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login and get JWT token |
| GET | /groups | Get all groups for logged in user |
| POST | /groups | Create a new group |
| POST | /groups/:id/members | Add member to group |
| POST | /expenses/:groupId | Add an expense |
| GET | /expenses/:groupId | Get all expenses in a group |
| GET | /expenses/:groupId/balances | Get balances for a group |

## Screenshots

> Add screenshots of your app here

## Author

Your Name — [GitHub](https://github.com/xjmldnish)