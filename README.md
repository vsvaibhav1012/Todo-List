# Todo App

Full-stack personal todo app with authentication, built with Next.js 14, Prisma, and PostgreSQL (Supabase).

## Stack

- **Frontend**: Next.js 14 App Router + TypeScript + Redux Toolkit + RTK Query + Tailwind CSS
- **Backend**: Next.js API Route Handlers (serverless functions on Vercel)
- **Database**: PostgreSQL via Supabase (transaction pooler) + Prisma ORM
- **Auth**: JWT in httpOnly cookies (15min access + 7d refresh with rotation)
- **Validation**: Zod (client + server)

## Local Setup

### 1. Clone and install

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Transaction pooler (port 6543) |
| `DIRECT_URL` | Supabase → Project Settings → Database → Direct connection (port 5432) |
| `JWT_ACCESS_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Same command again (different value) |

### 3. Run database migrations

```bash
npm run db:migrate
```

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel Deployment

### 1. Create Supabase project

- Go to supabase.com → New project
- Get **Transaction pooler** connection string (port 6543) → `DATABASE_URL`
- Get **Direct connection** string (port 5432) → `DIRECT_URL`
- Add `?pgbouncer=true&connect_timeout=10` to `DATABASE_URL`

### 2. Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo in the Vercel dashboard.

### 3. Set environment variables in Vercel

In Vercel dashboard → Settings → Environment Variables, add all vars from `.env.example`.

For **Production**:
- `COOKIE_DOMAIN` = `.vercel.app` (or your custom domain)
- `NODE_ENV` = `production`

For **Preview** deployments on `*.vercel.app`:
- `SameSite=Strict` works since preview URLs are same-origin.
- Custom preview domains may need `SameSite=None; Secure`.

### 4. Build command

In Vercel dashboard → Settings → Build & Output, set build command to:

```
prisma migrate deploy && next build
```

### 5. Prisma cold-start

`lib/prisma.ts` uses `globalThis` singleton. Supabase transaction pooler handles connection pooling.

## Environment Variables Reference

```bash
DATABASE_URL=           # Supabase transaction pooler (port 6543)
DIRECT_URL=             # Supabase direct connection (port 5432)
JWT_ACCESS_SECRET=      # 32+ byte random hex
JWT_REFRESH_SECRET=     # Different 32+ byte random hex
JWT_ACCESS_EXPIRES_IN=  # Default: 15m
JWT_REFRESH_EXPIRES_IN= # Default: 7d
NODE_ENV=               # development | production
COOKIE_DOMAIN=          # blank for localhost; .vercel.app for production
```

## QA Checklist

### Auth
- [ ] Register with valid email/password → redirected to /todos
- [ ] Register with existing email → clear error, no hash in response
- [ ] Register with weak password → strength indicator + validation error
- [ ] Login with correct credentials → works
- [ ] Login with wrong password → "Invalid credentials" (not "email not found")
- [ ] Login 6 times rapidly → rate limit error on attempt 6
- [ ] Page refresh on /todos → stays logged in (cookie + /api/auth/me rehydration)
- [ ] Logout → redirected to /login, cookies cleared
- [ ] Open two tabs, logout in one → other tab redirects to /login automatically
- [ ] Access /todos without being logged in → redirect to /login?from=/todos
- [ ] Access /login when already logged in → redirect to /todos

### Token rotation
- [ ] Access token expires (15min) → next request auto-refreshes transparently
- [ ] Manually clear `access_token` cookie (keep `refresh_token`) → refreshes on next request
- [ ] Manually replay old `refresh_token` after logout → token family revoked, 401 returned

### Todos
- [ ] Create todo → appears in list instantly
- [ ] Check/uncheck todo → optimistic toggle, no flash
- [ ] Inline edit: pencil → type → Enter saves, Escape cancels
- [ ] Delete: confirmation modal → confirm → removed from list
- [ ] Filter: All / Active / Done
- [ ] Filter: High / Medium / Low priority
- [ ] Search by title (case-insensitive)
- [ ] Empty state: "No todos yet — add your first one!"
- [ ] Filter with no results: "No todos match your filters."
- [ ] Network failure during optimistic update → toast error, UI rolls back

### Security
- [ ] GET /api/todos with no cookie → 401
- [ ] GET /api/todos/[other-users-todo-id] → 404 (not 403, ownership hidden)
- [ ] Check all responses: `passwordHash` never present
- [ ] Check cookies: httpOnly, Secure (in prod), SameSite=Strict
