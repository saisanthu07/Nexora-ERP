<div align="center">

# 🏢 Nexora ERP — Operations & Sales Portal

**A production-ready Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) platform.**  
Featuring role-based access control (RBAC), stock-concurrency control, customer tracking, sales challans, invoice PDF generation, automated CI/CD deployment, and Row Level Security (RLS) database protection.

---

[![Build & Deploy](https://github.com/saisanthu07/Nexora-ERP/actions/workflows/deploy.yml/badge.svg)](https.github.com)
![Node.js](https://img.shields.io/badge/Node.js-v20-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## 📋 Table of Contents
1. [Overview & Features](#-overview--features)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Concurrency Safety](#-architecture--concurrency-safety)
4. [Project Structure](#-project-structure)
5. [Getting Started (Local Development)](#-getting-started-local-development)
6. [Environment Variables Reference](#-environment-variables-reference)
7. [Demo Accounts](#-demo-accounts)
8. [Database & Security Setup (Supabase RLS)](#-database--security-setup-supabase-rls)
9. [Production Deployment](#-production-deployment)
10. [CI/CD Workflow (GitHub Actions)](#-cicd-workflow-github-actions)

---

## ✨ Overview & Features

### 🔐 Authentication & Access Control (RBAC)
- **Role-based Permissions**: Enforces distinct access rights across 4 roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **JWT Authorization**: Secure HTTP Bearer token authorization with token expiry handling.

### 👥 Customer CRM & Pipeline
- Customer master database with full business metadata (Name, GST Number, Business Type, Contact Info).
- Customer interaction notes and follow-up date management.

### 📦 Product & Inventory Management
- Real-time inventory tracking with alert thresholds for low stock (`minStock`).
- Automated stock movement auditing for every inventory deduction or addition.

### 📄 Sales Challans & Invoicing
- Multi-item sales challans with automated SKU and price snapshotting for accurate historical records.
- **Invoice PDF Export**: Clean, styled invoice layout ready to print or save as PDF directly from the browser.

### 🎨 Skeuomorphic UI Design System
- Custom **Ledgerworks Design System** with metallic brushed-steel sidebars, walnut-wood topbars, cream ledger-paper tables, and brass status rocker controls.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, TanStack React Query, React Router v6, React Hot Toast |
| **Backend** | Node.js, Express.js, TypeScript (Node16 resolution), Zod Validation |
| **Database & ORM** | PostgreSQL (Supabase), Prisma ORM (v5.22) |
| **Security & Auth** | BcryptJS password hashing, JSON Web Tokens (JWT), Helmet, CORS, Row Level Security (RLS) |
| **Deployment & CI/CD** | Render (Backend API), Vercel (Frontend SPA), GitHub Actions |

---

## ⚡ Architecture & Concurrency Safety

### Concurrency-Safe Stock Deductions
Stock reduction occurs **only** when a sales challan is confirmed. The confirmation pipeline (`backend/src/modules/challans/challan.service.ts`) executes within an atomic database transaction:

```text
Challan Confirm Request
        │
        ▼
1. Acquire Row Lock (FOR UPDATE) ──► Prevents race conditions / deadlocks
        │
        ▼
2. Validate Stock Availability  ──► Rejects with 409 INSUFFICIENT_STOCK if stock < order qty
        │
        ▼
3. Deduct Stock Quantities      ──► Atomic stock update per item
        │
        ▼
4. Log Stock Movement Audit     ──► Immutable audit trail linked to Challan ID
        │
        ▼
5. Commit Transaction           ──► 200 OK Response
```

---

## 📁 Project Structure

```text
mini-erp-crm/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated CI/CD GitHub Actions Workflow
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema models & relationships
│   │   ├── seed.ts             # Default demo database seeder
│   │   └── enable_rls.ts       # Database Row Level Security script
│   ├── src/
│   │   ├── config/             # DB & Environment Zod schema validation
│   │   ├── middleware/         # Auth, RBAC, Async & Error Handlers
│   │   ├── modules/            # Auth, Customers, Products, Challans
│   │   └── server.ts           # Express App Server Entry
│   ├── tsconfig.json           # Node16 TypeScript Configuration
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.jpg         # Custom Nexora ERP Favicon
│   ├── src/
│   │   ├── api/                # Axios API Service Client
│   │   ├── auth/               # AuthContext & ProtectedRoute Guardians
│   │   ├── components/         # Layout (Sidebar, Topbar) & UI controls
│   │   ├── pages/              # Dashboard, Customers, Products, Challans
│   │   └── styles/             # Global Skeuomorphic CSS & Print Styles
│   ├── vercel.json             # SPA Routing Rewrite Configuration
│   └── package.json
├── render.yaml                 # Render Infrastructure Blueprint
├── .gitignore                  # Production Root Gitignore
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js**: v20+
- **npm**: v10+
- **PostgreSQL**: Local instance or free cloud database on [Supabase](https://supabase.com)

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma Client & Push Database Schema
npx prisma generate
npx prisma db push

# Seed Demo Data (Admin, Sales, Products & Customers)
npm run prisma:seed

# Start Development Server (http://localhost:4000)
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start Frontend Dev Server (http://localhost:5173)
npm run dev
```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
```env
# Database connection (Pooled connection string for backend API)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"

# Direct database connection string (Used for Prisma migrations)
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Authentication Secrets
JWT_SECRET="super-secret-key-change-this-in-production-12345"
JWT_EXPIRES_IN="24h"

# Application Settings
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:4000/api
```

---

## 👤 Demo Accounts

Seed data provides pre-configured user accounts with different roles (Password for all: `Password123!`):

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | Full System Access (Manage Users, Cancel Challans, CRM, Products) |
| **Sales** | `sales@demo.com` | CRM Access, Create & Confirm Sales Challans |
| **Warehouse** | `warehouse@demo.com` | View Products, Manage Stock Levels & Stock Logs |
| **Accounts** | `accounts@demo.com` | Read-only Access to Customers, Challans & Financials |

---

## 🛡️ Database & Security Setup (Supabase RLS)

To protect public PostgreSQL database tables against unauthorized direct REST API access:

```bash
cd backend
npx ts-node prisma/enable_rls.ts
```

This enforces Row Level Security (RLS) across all 8 core tables (`users`, `customers`, `notes`, `products`, `stock_movements`, `challans`, `challan_items`, `challan_sequence`).

---

## 🌐 Production Deployment

### Backend on Render
1. Create a new **Web Service** on Render and link your repository.
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run prisma:deploy && npm start`
5. Set Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CORS_ORIGIN`).

### Frontend on Vercel
1. Import repository to Vercel.
2. Framework Preset: `Vite`
3. Root Directory: `frontend`
4. Set Environment Variable: `VITE_API_URL=https://<your-render-backend-url>/api`

---

## ⚙️ CI/CD Workflow (GitHub Actions)

The repository includes a GitHub Actions pipeline ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that automatically triggers on pushes to `main` or `master`:
- **Stage 1**: Typechecks & verifies TypeScript builds for both frontend and backend.
- **Stage 2**: Triggers automated deployment to Render API via deploy webhook.
- **Stage 3**: Deploys frontend SPA to Vercel Production environment.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
