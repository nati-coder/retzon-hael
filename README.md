# RETZON HA’EL website

Two separate apps. The browser talks to the backend only through the JSON API.

```
retzon-hael/
├─ backend/                 Node + Express + Postgres API (MVC)
│  ├─ db/schema.sql         tables, applied automatically on start
│  └─ src/
│     ├─ models/            M: all SQL (Sermon, Event, Setting, Submission, Admin)
│     ├─ controllers/       C: request handling and validation
│     ├─ routes/            URL → controller mapping (public + admin)
│     ├─ middleware/        auth (JWT), rate limits, error handling
│     ├─ config/ utils/     env, database pool, helpers
│     └─ app.js, server.js
└─ frontend/                V: static apps, no build step
   ├─ site/                 public website  (served at /)
   ├─ admin/                admin app       (served at /admin, login required)
   ├─ config.js             API_URL used by both apps
   └─ server.js             tiny static server for local use
```

## Run locally
**Backend**
1. Create a database: `createdb retzon`
2. `cd backend && cp .env.example .env` and fill it in (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
3. `npm install && npm start` → API on http://localhost:3000

**Frontend** (second terminal)
1. `cd frontend && npm install && npm start` → http://localhost:5000
2. Admin: http://localhost:5000/admin

The first admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` only if no admin exists. After signing in, change the password under Account, then remove `ADMIN_PASSWORD` from your environment.

## Deploy
- **Backend** (Render, Railway, Fly.io, VPS): set `NODE_ENV=production`, `DATABASE_URL`, `DATABASE_SSL`, a long `JWT_SECRET`, admin vars, and `CORS_ORIGINS=https://your-site-domain` (comma-separate several). Start command: `npm start`. Use HTTPS and enable database backups.
- **Frontend** (Netlify, Vercel, Cloudflare Pages, Nginx, or `node server.js`): edit `frontend/config.js` so `API_URL` is your backend URL. On a static host, publish `site/` as the root and `admin/` under `/admin`, and serve `config.js` at `/config.js`.

## API
Public: `GET /api/public`, `POST /api/volunteer`, `POST /api/contact`.
Admin (header `Authorization: Bearer <token>`): `POST /api/admin/login`, `GET /api/admin/me`, `POST /api/admin/password`, CRUD on `/api/admin/sermons` and `/api/admin/events`, `GET|PUT /api/admin/settings`, `GET /api/admin/inbox`, `DELETE /api/admin/inbox/:id`.

## Not included yet
Online payments (the Give button shows a notice; Stripe Checkout is the usual next step), file uploads (sermon media are links), and email notifications for new sign-ups or messages. Public pages never show donor or partner names, only the totals you enter.
# retzon-hael
