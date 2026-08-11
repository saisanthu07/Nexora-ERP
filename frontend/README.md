# Frontend — Ledgerworks

React + TypeScript + Vite, styled as a skeuomorphic office/ledger UI.

## Setup
```bash
npm install
cp .env.example .env    # set VITE_API_URL to your backend's /api URL
npm run dev
```

## Scripts
- `npm run dev` — start dev server (http://localhost:5173)
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally

## Structure
```
src/
├── api/            # axios client + one module per resource
├── auth/            # AuthContext, ProtectedRoute
├── components/
│   ├── layout/       # AppShell, Sidebar, Topbar
│   ├── ui/            # Button, FormControls, Modal
│   └── shared/         # StatusBadge, StatusRocker, PaginationBar
├── pages/
│   ├── customers/
│   ├── products/
│   └── challans/
├── styles/global.css  # the skeuomorphic design system
└── App.tsx
```

State management: React Query handles all server state (caching, refetch-on-mutation);
React Context handles only auth. No Redux — kept intentionally light.
