# DevFolio — Frontend

The React single-page app for **DevFolio**, a personal portfolio + blog. It is
the client half of a full-stack project; it talks to the companion Django REST
API in [`../portfolio-backend`](../portfolio-backend). The public site shows off
projects, skills, experience and blog posts, and a protected owner dashboard
manages all of that content from the browser.

> Single-owner by design. There is **no public sign-up** — the one owner account
> is created on the backend (`createsuperuser`), and the dashboard is the only
> authenticated surface.

---

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| UI library         | React 19                                           |
| Build tool         | Vite 8                                             |
| Routing            | react-router-dom v6                                |
| Server state       | TanStack React Query v5                            |
| HTTP               | axios (single instance, JWT refresh interceptor)   |
| Styling            | Tailwind CSS v3 (soft-gradient / glass design)     |
| Icons              | lucide-react (+ a small local brand-icon shim)     |
| Markdown           | react-markdown + remark-gfm                        |
| Notifications      | react-hot-toast                                    |
| Linting            | oxlint                                             |

Client state that isn't server data lives in two React contexts: **Auth**
(token + current user) and **Theme** (light / dark, persisted).

---

## Prerequisites

- **Node.js ≥ 18** (developed on Node 24).
- The **DevFolio backend** running and reachable (defaults to
  `http://127.0.0.1:8000`). See its README for setup and seed data.

---

## Getting started

```bash
npm install
```

Create a `.env` from the template and point it at your backend:

```bash
cp .env.example .env
```

```dotenv
# Base URL of the Django REST API (note the /api suffix)
VITE_API_URL=http://127.0.0.1:8000/api
# Origin the backend serves media from (fallback only — the API returns
# absolute media URLs already)
VITE_MEDIA_URL=http://127.0.0.1:8000
```

Run the dev server:

```bash
npm run dev
```

Vite serves the app at **http://localhost:5173**. The backend's
`CORS_ALLOWED_ORIGINS` already whitelists this origin (and `127.0.0.1:5173`).

### Scripts

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR            |
| `npm run build`   | Production build to `dist/`                   |
| `npm run preview` | Serve the built `dist/` locally               |
| `npm run lint`    | Lint the codebase with oxlint                 |

---

## Signing in

The dashboard lives at `/dashboard` and is gated by `ProtectedRoute`. Sign in at
`/login` with the owner account. When paired with the backend's seed data the
demo owner is:

```
username: owner
password: DevFolioDemo!2026
```

Only a superuser may reach the dashboard; a normal authenticated user is
rejected. Tokens are stored client-side and transparently refreshed by the axios
interceptor; a failed refresh logs out and redirects to `/login`.

---

## Routes

### Public (`PublicLayout` — navbar + footer)

| Path              | Page            | Notes                                       |
| ----------------- | --------------- | ------------------------------------------- |
| `/`               | Home            | Hero, featured projects/posts, skills       |
| `/about`          | About           | Bio, experience, education, full skill set  |
| `/projects`       | Projects        | Filter by category, paginated               |
| `/projects/:slug` | Project detail  | Markdown write-up, tech stack, links        |
| `/blog`           | Blog            | Search + category filter, paginated         |
| `/blog/:slug`     | Blog detail     | Post body, likes, view count, comments      |
| `/contact`        | Contact         | Validated message form → backend inbox      |
| `*`               | NotFound        | 404 fallback                                |

### Auth

| Path     | Page  |
| -------- | ----- |
| `/login` | Login |

### Dashboard (`/dashboard` — `ProtectedRoute` + `DashboardLayout`)

| Path                        | Page             | Purpose                              |
| --------------------------- | ---------------- | ------------------------------------ |
| _(index)_                   | Overview         | Stats and recent activity            |
| `posts`                     | PostsManager     | List / delete posts                  |
| `posts/new`, `posts/:slug/edit` | PostEditor   | Create / edit a post (Markdown)      |
| `projects`                  | ProjectsManager  | List / delete projects               |
| `projects/new`, `projects/:slug/edit` | ProjectEditor | Create / edit a project        |
| `skills`                    | SkillsManager    | CRUD skills (modal editor)           |
| `experience`                | ExperienceManager| CRUD work experience                 |
| `education`                 | EducationManager | CRUD education                       |
| `comments`                  | CommentsManager  | Moderate / approve / delete comments |
| `messages`                  | MessagesManager  | Read contact-form messages           |
| `profile`                   | ProfileManager   | Edit profile, avatar, résumé, password |

---

## Project structure

```
src/
├── main.jsx                # App bootstrap: providers + router
├── App.jsx                 # Route table
├── index.css               # Tailwind layers + design tokens
├── context/                # AuthContext, ThemeContext
├── lib/                    # api (axios), tokens, queryClient, paginated, format
├── hooks/                  # usePortfolio, useBlog, useInbox, usePageMeta
├── components/
│   ├── layout/             # PublicLayout, DashboardLayout, Navbar, Footer
│   ├── ui/                 # Button, Form, Modal, Badge, Pagination, Spinner, …
│   ├── dashboard/          # Dashboard-specific UI
│   └── *.jsx               # ProjectCard, PostCard, SkillCard, Comment*, Markdown
└── pages/
    ├── *.jsx               # Public pages
    └── dashboard/          # Dashboard pages + editors
```

### How data flows

- **`lib/api.js`** — a single axios instance. A request interceptor attaches the
  JWT and an `X-Visitor-Id` header (used by the backend to key anonymous likes /
  views without double-counting). A response interceptor refreshes an expired
  access token once, then retries or logs out.
- **`hooks/`** — React Query hooks wrap the endpoints (portfolio, blog, inbox),
  giving caching, background refetch, and mutation invalidation for free.
- **`lib/paginated.js`** — `asList` / `pageCount` helpers normalise DRF's
  pagination envelope so components can treat responses uniformly.

---

## Notes

- **Design direction:** soft-gradient / glassmorphism — layered shadows, blurred
  translucent cards, generous radii, pastel-to-vivid accents, and a real dark
  mode toggled from the navbar (persisted per browser).
- **Media URLs** are returned absolute by the API, so images render without any
  client-side URL joining; `VITE_MEDIA_URL` is only a fallback.
- `dist/` and `.env` are git-ignored; only `.env.example` is committed.
