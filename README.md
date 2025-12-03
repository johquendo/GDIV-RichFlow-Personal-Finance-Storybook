<div align="center">
  <img src="frontend/public/assets/richflow_logo.png" alt="RichFlow Logo" width="300">
  
  # RichFlow — Personal Finance Management
  
  ### *See Where Your Money Flows — and Make It Work for You*

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <br>

  **RichFlow** is a comprehensive personal finance management application designed to help you track your income, expenses, assets, and liabilities — empowering you to visualize your path to financial freedom. It is heavily based on Robert Kiyosaki's *Rich Dad Poor Dad* book series, and is also a practical way to learn about financial literacy and wealth-building education.

  [Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Architecture](#-architecture) • [Contributors](#-contributors)

</div>

---

## 🌟 Features 

### 💰 Complete Financial Tracking

<table>
<tr>
<td width="50%">

**Income Statement Management**
- Track **Earned**, **Portfolio**, and **Passive** income streams
- Categorize expenses with full CRUD operations
- Real-time calculation of net cashflow
- Income quadrant analysis (Employee, Self-Employed, Business Owner, Investor)

</td>
<td width="50%">

**Balance Sheet Management**
- Asset tracking (investments, property, vehicles, etc.)
- Liability management (loans, mortgages, credit card debt)
- Automatic net worth calculation
- Cash savings monitoring

</td>
</tr>
</table>

### 📊 Advanced Analytics & Insights

| Feature | Description |
|---------|-------------|
| **Financial Snapshot** | Comprehensive view of your current financial state with key metrics |
| **Time Machine** | Reconstruct your financial state for any historical date using event-sourced data |
| **Trajectory Analysis** | Track your financial progress over time through comprehensive visualizations |
| **Comparison Reports** | Compare financial states between two dates to measure progress |
| **Saki AI Assistant** | AI-generated insights and recommendations about your current financial state through your income, expenses, and balance sheet |

### 📈 Key Metrics Tracked

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Wealth Velocity   │  Solvency Ratio   │  Freedom Gap   │  Runway (Months) │
├─────────────────────────────────────────────────────────────────────────────┤
│  Asset Efficiency  │  Savings Rate     │  Passive Coverage  │  Net Worth   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🤖 Saki AI Assistant

Your personal AI-powered financial advisor that analyzes your current income, expenses, and balance sheet to provide personalized tips, insights, and recommendations for improving your financial well-being.

### 🔐 Secure Admin Panel

- User management and oversight
- Financial data inspection for support purposes
- System-wide analytics dashboard
- Role-based access control

### 📜 Event Log & Audit Trail

- **Immutable event logging** for complete transparency
- Track all financial changes with full history
- Historical currency tracking per event
- Advanced filtering and search capabilities

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Library |
| **TypeScript** | 5.9.3 | Type Safety |
| **React Router DOM** | 6.30.1 | Client-side Routing |
| **Recharts** | 3.4.1 | Data Visualization |
| **Tailwind CSS** | 4.1.16 | Utility-first Styling |
| **Webpack** | 5.102.1 | Module Bundler |
| **Babel** | 7.28.5 | JavaScript Compiler |

### Backend

| Technology | Version | Purpose |
|------------|---------|----------|
| **Node.js** | 20+ | Runtime Environment |
| **Express** | 5.1.0 | Web Framework |
| **TypeScript** | 5.9.3 | Type Safety |
| **Prisma** | 7.0.1 | ORM & Database Toolkit |
| **PostgreSQL** | Latest | Primary Database |
| **bcrypt** | 6.0.0 | Password Hashing |
| **jsonwebtoken** | 9.0.2 | JWT Authentication |
| **Google GenAI** | 1.29.0 | AI Assistant Integration |

### Development Tools

| Tool | Purpose |
|------|----------|
| **Nodemon** | Auto-restart during development |
| **tsx** | TypeScript execution (ESM) |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20.19.0 or higher (required for Prisma 7)
- **PostgreSQL** database
- **npm** or **yarn** package manager

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/VinceAL-9/GDIV-RichFlow-Personal-Finance.git
cd GDIV-RichFlow-Personal-Finance
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
# Database
# For local PostgreSQL:
DATABASE_URL="postgresql://username:password@localhost:5432/richflow_db"
# For cloud PostgreSQL (e.g., Supabase, Neon), add sslmode:
# DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# JWT Secrets (Change these to random secure strings in production!)
JWT_SECRET="your-jwt-secret-change-in-production"
ACCESS_TOKEN_SECRET="your-access-token-secret-change-in-production"

# Gemini AI Integration
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="gemini-pro"

# Server
PORT=5000
NODE_ENV=development
```

Run database synchronization:

```bash
# Generate Prisma client (uses prisma.config.ts for configuration)
npx prisma generate

# Push schema to database (development)
npx prisma db push

# (Optional) Seed the database
npm run seed-currency
npm run seed-users
```

Start the backend server:

```bash
npm run dev
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file (if needed)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

#### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Prisma Studio**: `npx prisma studio` (Database GUI)

---

## 📚 Documentation

### Project Structure

```
GDIV-RichFlow-Personal-Finance/
│
├── 📁 backend/
│   ├── 📄 prisma.config.ts        # Prisma 7 CLI configuration
│   ├── 📁 generated/
│   │   └── 📁 prisma/             # Generated Prisma client
│   │
│   ├── 📁 prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── 📁 seed-files/         # Database seeders
│   │
│   └── 📁 src/
│       ├── server.ts              # Entry point
│       ├── 📁 config/             # Configuration
│       ├── 📁 controllers/        # Request handlers
│       ├── 📁 services/           # Business logic
│       ├── 📁 routes/             # API routes
│       ├── 📁 middleware/         # Express middleware
│       ├── 📁 types/              # TypeScript types
│       └── 📁 utils/              # Utility functions
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   └── 📁 assets/             # Static assets & logo
│   │
│   └── 📁 src/
│       ├── index.tsx              # Entry point
│       ├── 📁 pages/              # Page components
│       ├── 📁 components/         # Reusable components
│       ├── 📁 context/            # React contexts
│       ├── 📁 hooks/              # Custom hooks
│       ├── 📁 state/              # State management
│       ├── 📁 types/              # TypeScript types
│       ├── 📁 utils/              # Utility functions
│       └── 📁 styles/             # Global styles
│
└── 📁 docs/                       # Documentation
    ├── backend-progress.md
    ├── frontend-progress.md
    ├── user-registration-and-authentication.md
    ├── financial-data-management.md
    ├── event-log-and-analysis.md
    └── remaining-features.md
```

### API Reference

#### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET` | `/api/auth/verify` | Verify JWT token |

#### Financial Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/income` | Get all income lines |
| `POST` | `/api/income` | Create income line |
| `PUT` | `/api/income/:id` | Update income line |
| `DELETE` | `/api/income/:id` | Delete income line |
| `GET` | `/api/expenses` | Get all expenses |
| `POST` | `/api/expenses` | Create expense |
| `PUT` | `/api/expenses/:id` | Update expense |
| `DELETE` | `/api/expenses/:id` | Delete expense |

#### Balance Sheet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/balance-sheet` | Get balance sheet |
| `POST` | `/api/balance-sheet/assets` | Add asset |
| `PUT` | `/api/balance-sheet/assets/:id` | Update asset |
| `DELETE` | `/api/balance-sheet/assets/:id` | Delete asset |
| `POST` | `/api/balance-sheet/liabilities` | Add liability |
| `PUT` | `/api/balance-sheet/liabilities/:id` | Update liability |
| `DELETE` | `/api/balance-sheet/liabilities/:id` | Delete liability |

#### Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analysis/snapshot` | Get financial snapshot |
| `GET` | `/api/analysis/trajectory` | Get financial trajectory |
| `POST` | `/api/analysis/snapshot` | Create snapshot checkpoint |

#### Event Log Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | Get all events (with filters) |
| `GET` | `/api/events/:entityType/:entityId` | Get entity-specific events |

---

## 🏗 Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + TypeScript)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │   Pages     │  │ Components  │  │   Context   │  │   State Management  ││
│  │ - Dashboard │  │ - Income    │  │ - Auth      │  │ - Zustand           ││
│  │ - Analysis  │  │ - Expenses  │  │ - Financial │  │ - React Hooks       ││
│  │ - EventLog  │  │ - Summary   │  │             │  │                     ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘│
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │ HTTPS / REST API
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Express + TypeScript)                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Middleware: Auth | Validation | Rate Limiting | Error Handling      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Controllers │  │  Services   │  │   Routes    │  │    Utilities    │  │
│  │ - auth      │  │ - auth      │  │ - /auth     │  │ - jwt           │  │
│  │ - income    │  │ - income    │  │ - /income   │  │ - password      │  │
│  │ - expense   │  │ - expense   │  │ - /expense  │  │ - validation    │  │
│  │ - analysis  │  │ - analysis  │  │ - /analysis │  │ - quadrant      │  │
│  │ - ai        │  │ - ai        │  │ - /ai       │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │ Prisma ORM
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE (PostgreSQL)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │    User     │  │   Income    │  │   Balance   │  │     Event       │  │
│  │   Session   │  │   Expense   │  │    Sheet    │  │    Snapshot     │  │
│  │  Currency   │  │  CashSavings│  │Asset/Liabil.│  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Event-Sourcing Pattern

RichFlow uses an **event-sourcing architecture** for the analysis system, enabling powerful features like time-travel and complete audit trails:

```
User Action → Event Created → Event Stored → State Reconstructed
                    ↓
           ┌───────────────────┐
           │   Event Types     │
           ├───────────────────┤
           │ • CREATE          │
           │ • UPDATE          │
           │ • DELETE          │
           └───────────────────┘
                    ↓
           ┌───────────────────┐
           │   Entity Types    │
           ├───────────────────┤
           │ • INCOME          │
           │ • EXPENSE         │
           │ • ASSET           │
           │ • LIABILITY       │
           │ • CASH_SAVINGS    │
           │ • USER            │
           └───────────────────┘
```

### Database Schema

```prisma
// Core Financial Models
User ─────┬───── IncomeStatement ───── IncomeLine
          │                      ───── Expense
          │
          ├───── BalanceSheet ──────── Asset
          │                     ────── Liability
          │
          ├───── CashSavings
          │
          ├───── Session (Authentication)
          │
          ├───── Event (Audit Trail)
          │
          └───── FinancialSnapshot (Cache)
```

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Gold** | `#EDCA69` | Primary brand color, accents, highlights |
| **Purple** | `#7345AF` | Secondary brand color, buttons, gradients |
| **Dark** | `#1E1E1E` | Background, dark theme |
| **Black** | `#000000` | Dashboard backgrounds |
| **Gray** | `#171717` | Card backgrounds |

### Typography

| Font | Weight | Usage |
|------|--------|-------|
| **Montserrat** | 700, 800 | Headings, bold text |
| **Roboto** | 300 italic, 400 | Body text, descriptions |

---

## 📋 Available Scripts

### Backend

```bash
npm run dev                    # Start development server with nodemon
npm run seed-currency          # Seed currency data
npm run seed-users             # Seed sample users
npm run seed-timemachine       # Seed time machine data
npm run seed-timemachine-freedom  # Seed financial freedom scenario
npm run seed-timemachine-broke    # Seed financial struggle scenario
```

### Frontend

```bash
npm start                      # Start development server (port 3000)
npm run build                  # Build for production
```

### Database (Prisma 7)

```bash
npx prisma generate            # Generate Prisma client (uses prisma.config.ts)
npx prisma db push             # Push schema to database (development)
npx prisma studio              # Open Prisma Studio (database GUI)
npx prisma migrate dev         # Create and apply migrations (if needed)
```

> **Note:** Prisma 7 uses a driver adapter architecture. The `@prisma/adapter-pg` is used for PostgreSQL connections with SSL support for cloud databases.

---

## 🔒 Security Features

- **JWT-based authentication** with session tracking
- **bcrypt password hashing** with configurable salt rounds
- **Rate limiting** on authentication endpoints (5 attempts/15 min)
- **Input validation** with express-validator
- **CORS configuration** for frontend origin
- **Immutable event logs** for complete audit trails
- **Protected routes** with authentication middleware

---


## 👥 Contributors

<table>
<tr>
<td align="center"><strong>Vince Latabe</strong><br>Project Lead, Backend Architecture and Database, Documentation, Clean Up</td>
<td align="center"><strong>Lance Demonteverde</strong><br>Authentication, Financial State Reconstruction</td>
<td align="center"><strong>Gian Umadhay</strong><br>Frontend Development, Analysis Dashboard, Financial Visualizationss</td>
</tr>
<tr>
<td align="center"><strong>Joeben Quimpo</strong><br>Balance Sheet, UI/UX Design for Dashboard, Mobile Responsiveness</td>
<td align="center"><strong>Johan Oquendo</strong><br>Admin Panel, Mobile Responsiveness, AI Assistant</td>
<td align="center"><strong>Red Guilaran</strong><br>Event Log, Snapshot Comparisons</td>
</tr>
</table>

---

## 🙏 Acknowledgments

- Inspired by the principles from *Rich Dad Poor Dad* by Robert Kiyosaki
- Built with modern web technologies and best practices
- Designed for financial literacy and wealth-building education

---

<div align="center">

**Made with 💰 by GDIV, the RichFlow Team**

*Start your journey to financial freedom today!*

</div>
