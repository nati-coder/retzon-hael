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

## Volunteer activity gallery
Admin → **Gallery** tab. Add an activity (title + date), then press **Photos & videos**:
- **Photos**: choose one or many files. They are resized in the browser (long edge max 1600 px for display plus a 420 px thumbnail), so landscape and portrait photos both keep their shape. They are stored in the database, so they survive redeploys on hosts with temporary disks.
- **Videos**: paste any YouTube link (watch, youtu.be, shorts, live). Only the video id is stored. Visitors click the thumbnail and the video plays on your site via youtube-nocookie.com.
- On the website the **Gallery** section lets visitors pick a date (calendar or recent-date chips). That day's photos and videos appear as cards: the first 3 in a grid, the rest in a swipeable carousel (arrows wrap around, pagination dots). Clicking a card opens it in the lightbox.
- Limits: 80 photos per activity, 2 MB per resized photo. The tables are created automatically on the next backend start.

## Sermons and the media lightbox
Admin → **Sermons** now also has **Speaker / Pastor**, **Scripture reference** and an optional **Thumbnail image link**. The new columns are added automatically on the next backend start.
- **Video link** accepts a YouTube URL (`watch?v=`, `youtu.be/`, `shorts/`, `live/`, `embed/`) or a direct `.mp4`/`.webm` file. YouTube plays in an on-site `youtube.com/embed/{id}?autoplay=1&enablejsapi=1` iframe; files play in a native `<video>`. Any other link opens a "Watch video" button.
- Cards: first 3 in a grid (stacked on mobile), the rest in a carousel. Sermon and gallery cards share the same code (`cardHtml`, `deckHtml`, `initCars`, `LB` in `site/js/app.js`).
- Lightbox: dimmed `rgba(0,0,0,.8)` backdrop, close with X, Esc or a backdrop click; left/right arrows, arrow keys or swipe move through the set.

## API
Public: `GET /api/public`, `GET /api/gallery`, `GET /api/media/:id` (photo; `?size=thumb` for thumbnail), `POST /api/volunteer`, `POST /api/contact`.
Admin (header `Authorization: Bearer <token>`): `POST /api/admin/login`, `GET /api/admin/me`, `POST /api/admin/password`, CRUD on `/api/admin/sermons` and `/api/admin/events`, `GET|PUT /api/admin/settings`, `GET /api/admin/inbox`, `DELETE /api/admin/inbox/:id`.

## Not included yet
Online payments (the Give button shows a notice; Stripe Checkout is the usual next step), file uploads (sermon media are links), and email notifications for new sign-ups or messages. Public pages never show donor or partner names, only the totals you enter.
