# Ledgerworks — Mini ERP + CRM Operations Portal

A skeuomorphic-styled operations portal: JWT auth with role-based access (Admin, Sales,
Warehouse, Accounts), a Customer CRM, a Product & Inventory register, and a Sales Challan
workflow with a concurrency-safe stock-reduction transaction.

## Stack
- **Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL, JWT, Zod
- **Frontend:** React, TypeScript, Vite, React Query, React Router
- **Deploy:** Vercel (frontend) · Render (backend) · Neon/Supabase (Postgres)

## Project structure
```
mini-erp-crm/
├── backend/     # Express API — see backend/README.md
└── frontend/    # React app — see frontend/README.md
```

## Quick start (local)

### 1. Database
Create a free Postgres instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
Copy the pooled connection string (for the app) and the direct connection string (for migrations).

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev                # http://localhost:4000
```

**Important:** `prisma generate` and `prisma migrate dev` need outbound internet access to
download Prisma's query engine binaries. If you're running this behind a restrictive firewall
or in a sandboxed CI environment, allow `binaries.prisma.sh` (or use Prisma's `--data-proxy`
mode). This is a one-time download, cached afterward.

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL=http://localhost:4000/api
npm run dev                # http://localhost:5173
```

### 4. Log in
Seeded demo accounts (password for all: `Password123!`):

| Role | Email |
|---|---|
| Admin | admin@demo.com |
| Sales | sales@demo.com |
| Warehouse | warehouse@demo.com |
| Accounts | accounts@demo.com |

## Deployment (free tier)

**Database — Neon**
1. Create a project, copy the pooled connection string (`DATABASE_URL`) and direct string (`DIRECT_URL`).
2. Run `npx prisma migrate deploy` once against `DIRECT_URL` before first deploy.

**Backend — Render**
1. New Web Service → connect this repo → root directory `backend/`.
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `npm run start`
4. Env vars: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN=24h`, `CORS_ORIGIN=<your Vercel URL>`
5. Free tier spins down on inactivity — the first request after idle takes ~30–50s.

**Frontend — Vercel**
1. Import the repo → root directory `frontend/`.
2. Env var: `VITE_API_URL=https://<your-render-service>.onrender.com/api`
3. Deploy, then add the resulting URL to the backend's `CORS_ORIGIN`.

## What makes the challan logic production-grade

Stock is only ever reduced when a challan is **confirmed**, never on draft creation. The
confirm operation (`backend/src/modules/challans/challan.service.ts` → `confirmChallan`) runs
inside a single database transaction that:

1. Row-locks (`FOR UPDATE`) every product involved, in sorted order, to prevent deadlocks
   between two challans sharing products.
2. Validates stock for **every** line item before mutating **any** of them — no partial
   reductions on failure.
3. Writes an audit-trail `StockMovement` row for every reduction, linked back to the challan
   via `refType`/`refId`.
4. Rejects the confirm with `409 INSUFFICIENT_STOCK` if any line can't be fulfilled.

Challan line items also store a **snapshot** of the product's name, SKU, and price at creation
time, so historical challans stay accurate even if the product is edited or repriced later.

## Design notes — skeuomorphism

The UI (`frontend/src/styles/global.css`) leans into physical-office materials rather than a
flat/generic dashboard look:
- **Brushed-steel sidebar** with a fine diagonal highlight texture
- **Walnut-wood topbar** styled as a nameplate strip
- **Cream ledger-paper tables** with ruled rows and ink-brown headers
- **Embossed/pressable buttons** — layered box-shadows that visibly "press in" on click
- **A brass rocker switch** as the challan status indicator (Draft / Confirmed / Cancelled)
- **Leather-bound panels** with a dashed stitching border for emphasis cards

No external image assets are used — all texture comes from CSS gradients and box-shadows, so
there's nothing extra to host or load.
