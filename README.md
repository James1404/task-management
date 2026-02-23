# Task Management App

A simple full-stack task management application with JWT authentication.  
Users can register, log in, create projects, and manage tasks.

---

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT (access + refresh tokens)

### Frontend

- React
- TypeScript
- Vite
- Axios

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/james1404/task-management.git
cd yourrepo
```

### 2. Install backend

```bash
cd backend
npm install
```

### 3. Setup .env

```bash
cp .env.example .env
# Then update it to your settings
```

### 4. Setup prisma

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Setup prisma

```bash
npm run dev
```
