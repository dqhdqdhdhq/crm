# Productivity Dashboard

A modern, feature-rich productivity dashboard built with React, TypeScript, and Vite.

## Features

- **Task Management**: Kanban-style pipeline with drag & drop functionality
- **Rich Text Pages**: Notion-like page editor with multiple block types
- **Calendar**: Event management with detailed popups
- **Prospects CRM**: Customer relationship management for sales
- **Calculator**: Global glassmorphic calculator tool
- **Local Storage**: All data persists locally in your browser

## Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Extract the project files** to your desired location

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to the URL shown in the terminal (usually `http://localhost:5173` or `http://localhost:5174`)

## Available Scripts

- `npm run dev` - Start both API server (port 5174) and Vite (port 5173/5174) together
- `npm run client` - Vite only
- `npm run server` - API server only
- `npm run server:install` - Install server dependencies
- `npm run import:leads -- <path.json>` - Import a JSON dump into SQLite
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend (local Node + SQLite)

Lead data is persisted in SQLite via a local Hono server in `server/`. Other
entities (proof assets, etc.) still use localStorage.

### First-time setup

```bash
npm install
npm run server:install
npm run dev          # boots server + vite together
```

The API listens on `http://localhost:5174`. The Vite client reads
`VITE_CRM_API_URL` if set, otherwise it talks to that URL by default.

The SQLite database lives at `server/data/crm.db` (git-ignored). On first
boot, if the DB is empty, the client seeds it with the in-process seed data
from `src/hooks/useCRM.ts`.

### Importing existing localStorage data

1. Open the old version of the app in your browser.
2. In DevTools console, copy your leads to the clipboard:

   ```js
   copy(localStorage.getItem('crm-leads'))
   ```

3. Paste into a file (or pipe via clipboard) and run the importer:

   ```bash
   pbpaste > /tmp/crm-dump.json
   npm run import:leads -- /tmp/crm-dump.json
   # — or —
   pbpaste | npm --prefix server run import -- --stdin
   ```

The importer accepts either the raw array stored under `crm-leads` or a full
localStorage dump of the form `{ "crm-leads": [...] }`.

### API surface

| Method | Path           | Description       |
|--------|----------------|-------------------|
| GET    | `/health`      | Liveness check    |
| GET    | `/leads`       | List all leads    |
| GET    | `/leads/:id`   | Get one lead      |
| POST   | `/leads`       | Upsert a lead     |
| PATCH  | `/leads/:id`   | Partial update    |
| DELETE | `/leads/:id`   | Delete a lead     |

## Project Structure 