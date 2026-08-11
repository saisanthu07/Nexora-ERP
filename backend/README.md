# Backend — Ledgerworks API

Express + TypeScript + Prisma + PostgreSQL.

## Setup
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Scripts
- `npm run dev` — start with hot reload (nodemon + ts-node)
- `npm run build` — compile TypeScript to `dist/`
- `npm run start` — run the compiled build
- `npm run prisma:migrate` — create/apply a migration in dev
- `npm run prisma:deploy` — apply migrations in production
- `npm run prisma:seed` — seed demo users/customers/products
- `npm run typecheck` — type-check without emitting

## Folder structure
```
src/
├── config/        # env validation, Prisma client singleton
├── middleware/     # auth, role checks, validation, error handling
├── modules/
│   ├── auth/
│   ├── customers/
│   ├── products/
│   └── challans/    # core business logic — see challan.service.ts
├── routes/          # mounts all module routers under /api
├── utils/           # ApiError, response envelope, pagination
├── app.ts
└── server.ts
```

## API overview
All endpoints are under `/api`. See the root README and inline route files for the full list.
Every response uses the envelope:
```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 0 } }
{ "success": false, "error": { "code": "INSUFFICIENT_STOCK", "message": "..." } }
```
