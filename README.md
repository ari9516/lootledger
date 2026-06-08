# 🎮 LootLedger

<div align="center">

![LootLedger Banner](https://img.shields.io/badge/LootLedger-Gaming%20Finance%20Tracker-6366f1?style=for-the-badge&logo=gamepad&logoColor=white)

**Track gaming profits, losses & transactions**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://lootledger-gamma.vercel.app) · [API](https://lootledger.onrender.com) · [Report Bug](https://github.com/ari9516/lootledger/issues) · [Request Feature](https://github.com/ari9516/lootledger/issues)

</div>

---

## 🚀 Live Demo

| | URL |
|---|---|
| **Frontend** | https://lootledger-gamma.vercel.app |
| **Backend API** | https://lootledger.onrender.com |

> Note: Backend is hosted on Render's free tier and may take 30–60 seconds to wake up on first request.

---

## 📖 About The Project

**LootLedger** is a full-stack personal finance tracker built specifically for gaming platform economies. Whether you're flipping CS2 skins, trading in-game items, or tracking Valorant point purchases — LootLedger gives you a clear, data-driven picture of exactly where your money goes and what comes back.

Log every deposit, purchase, sale, withdrawal, and loss. The dashboard then aggregates your transactions into weekly, monthly, and yearly profit/loss reports with interactive charts — so you always know if you're actually winning.

### Why I Built This

Most finance apps aren't built for gamers. They don't understand the difference between a skin purchase and a skin sale, or how to calculate net profit from trades. LootLedger is purpose-built for that use case, with a clean REST API designed to eventually plug into live gaming platform APIs for automated tracking.

---

## ✨ Features

### Core
- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 💸 **Transaction Logging** — Add, edit, and delete transactions with type, category, date, and notes
- 📊 **P&L Analytics** — Automatic profit/loss calculation across all transactions
- 📅 **Time Filters** — Summary views for this week, this month, this year, and all-time
- 🔍 **Advanced Filtering** — Filter transactions by type and custom date ranges
- 📈 **Interactive Charts** — Line chart showing money in vs money out over time

### Transaction Types Supported
| Type | Description |
|---|---|
| `deposit` | Money added to a platform |
| `purchase` | In-game item or content bought |
| `sale` | Item sold on marketplace |
| `withdrawal` | Money taken out |
| `loss` | Money lost on trade or bet |

### Planned (v2)
- 📤 CSV export of transaction history
- 🔗 Live Steam Marketplace API integration
- 🪙 Coinbase OAuth for crypto gaming wallets
- 📧 Weekly P&L summary via email
- 🌐 Chrome extension for auto-logging on gaming marketplaces

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **PostgreSQL** | Relational database |
| **Prisma ORM** | Type-safe database access and migrations |
| **JWT** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Jest + Supertest** | Unit and integration testing |
| **Nodemon** | Development hot-reload |

### Frontend
| Technology | Purpose |
|---|---|
| **React (Vite)** | UI framework |
| **Tailwind CSS v4** | Utility-first styling |
| **Recharts** | Interactive data charts |
| **Axios** | HTTP client with interceptors |
| **React Router v7** | Client-side routing |

### Infrastructure
| Service | Purpose |
|---|---|
| **Render** | Backend API + PostgreSQL hosting |
| **Vercel** | Frontend hosting with CI/CD |
| **GitHub** | Version control |

---

## 📁 Project Structure

```
lootledger/
│
├── client/                          # React frontend (Vite)
│   └── src/
│       ├── api/
│       │   └── axios.js             # Base Axios instance with interceptors
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── TransactionCard.jsx
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx        # Analytics + charts
│       │   └── Transactions.jsx     # CRUD interface
│       ├── App.jsx
│       └── main.jsx
│
├── server/                          # Node.js backend
│   ├── controllers/
│   │   ├── authController.js        # Register + login logic
│   │   └── transactionController.js # Full CRUD + summary logic
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── prisma/
│   │   ├── migrations/              # Auto-generated migration history
│   │   └── schema.prisma            # Database schema
│   ├── routes/
│   │   ├── auth.js                  # Auth route mapping
│   │   └── transactions.js          # Transaction route mapping
│   ├── .env                         # Environment variables (gitignored)
│   ├── .gitignore
│   ├── index.js                     # Express entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL installed and running locally
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ari9516/lootledger.git
cd lootledger
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file inside `/server`:

```env
DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/lootledger"
JWT_SECRET="your_super_secret_jwt_key_here"
PORT=5000
```

Run Prisma migrations and start the server:

```bash
npx prisma migrate dev --name init
npm run dev
```

Backend runs at → `http://localhost:5000`

### 3. Frontend setup

```bash
cd ../client
npm install
npm run dev
```

Create a `.env` file inside `/client`:

```env
VITE_API_URL=http://localhost:5000/api
```

Frontend runs at → `http://localhost:5173`

---

## 📡 API Endpoints

### Base URL
```
https://lootledger.onrender.com/api
```

### Auth Routes

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | ❌ | `{ email, password }` | Register new user |
| `POST` | `/auth/login` | ❌ | `{ email, password }` | Login and receive JWT |

### Transaction Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/transactions` | ✅ | Get all transactions |
| `GET` | `/transactions?type=sale` | ✅ | Filter by type |
| `GET` | `/transactions?startDate=&endDate=` | ✅ | Filter by date range |
| `GET` | `/transactions/summary` | ✅ | All-time P&L summary |
| `GET` | `/transactions/summary?period=week` | ✅ | Weekly summary |
| `GET` | `/transactions/summary?period=month` | ✅ | Monthly summary |
| `GET` | `/transactions/summary?period=year` | ✅ | Yearly summary |
| `POST` | `/transactions` | ✅ | Create new transaction |
| `PUT` | `/transactions/:id` | ✅ | Update transaction |
| `DELETE` | `/transactions/:id` | ✅ | Delete transaction |

### Request / Response Examples

**Register**
```json
POST /api/auth/register
{
  "email": "ari@example.com",
  "password": "securepass123"
}

Response 201:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": { "id": "uuid", "email": "ari@example.com" }
}
```

**Create Transaction**
```json
POST /api/transactions
Authorization: Bearer <token>

{
  "amount": 1250.00,
  "type": "sale",
  "category": "CS2 Skins",
  "date": "2026-06-07",
  "notes": "Sold AWP Dragon Lore"
}

Response 201:
{
  "id": "uuid",
  "amount": 1250,
  "type": "sale",
  "category": "CS2 Skins",
  "date": "2026-06-07T00:00:00.000Z",
  "notes": "Sold AWP Dragon Lore",
  "userId": "uuid",
  "createdAt": "2026-06-07T10:30:00.000Z",
  "updatedAt": "2026-06-07T10:30:00.000Z"
}
```

**Summary Response**
```json
GET /api/transactions/summary?period=month
Authorization: Bearer <token>

{
  "totalIn": 3200.00,
  "totalOut": 1800.00,
  "netProfit": 1400.00,
  "transactionCount": 12,
  "period": "month"
}
```

---

## 🔐 Authentication

All transaction routes require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for **7 days**. On expiry, re-authenticate via `/api/auth/login`.

---

## 🗄️ Database Schema

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String
  createdAt    DateTime      @default(now())
  transactions Transaction[]
}

model Transaction {
  id        String   @id @default(uuid())
  amount    Float
  type      String   // deposit | sale | purchase | withdrawal | loss
  category  String
  date      DateTime
  notes     String?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🧪 Running Tests

```bash
cd server
npm test
```

Tests cover:
- Transaction P&L calculation logic
- Summary aggregation by period
- Auth middleware token verification

---

## 🚀 Deployment

### Backend → Render

1. Push code to GitHub
2. Go to render.com → New Web Service → connect repo
3. Set root directory to `server`
4. Set build command: `npm install && npx prisma generate`
5. Set start command: `npx prisma migrate deploy && node index.js`
6. Create a PostgreSQL database on Render
7. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`

### Frontend → Vercel

1. Go to vercel.com → Import GitHub repo
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://lootledger.onrender.com/api`
4. Add `vercel.json` in `/client` for React Router support
5. Deploy

---

## 🤝 Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 👨‍💻 Author

**Arnab Kumar**
Computer Science @ VIT Bhopal University

[![GitHub](https://img.shields.io/badge/GitHub-ari9516-181717?style=flat-square&logo=github)](https://github.com/ari9516)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/arnab-kumar-980442285/)

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  <sub>Built with ☕ and too many late nights — GSSoC 2026</sub>
</div>
