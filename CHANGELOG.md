# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-14

### Added

#### Application
- SvelteKit SSR todo application backed by SQLite via `better-sqlite3`
- **List todos** — server `load()` returns all rows from the `todos` table ordered by `created_at DESC`
- **Create todo** — `?/create` form action inserts a new row; server-side validation rejects empty titles
- **Toggle completion** — `?/toggle` form action flips the `completed` bit using a `CASE` expression (`0 → 1`, `1 → 0`)
- **Delete todo** — `?/delete` form action removes a row by primary key
- Empty-state message shown when no todos exist
- Strike-through styling and reduced opacity for completed todos
- Responsive, zero-dependency CSS layout (max-width 600px, card-style todo items)

#### Database
- `todos` table auto-created on startup via `CREATE TABLE IF NOT EXISTS`
- Schema: `id INTEGER PK AUTOINCREMENT`, `title TEXT NOT NULL`, `completed INTEGER DEFAULT 0`, `created_at TEXT DEFAULT (datetime('now'))`
- Singleton `better-sqlite3` database instance exported from `src/lib/server/db.js`

#### Architecture
- 100 % SSR — all data operations run server-side; no client-side `fetch` calls
- Progressive enhancement via native HTML form `POST` + SvelteKit form actions
- Server-only database module (`$lib/server/db.js`) — never bundled to the client
- Svelte 5 `$props()` reactive binding in the page component

### Fixed

- Aligned UI form `action` attributes with server-defined action names (`?/create`, `?/toggle`, `?/delete`)
- Corrected create-form `input` field name from `text` → `title` to match `formData.get('title')` on the server
- Fixed template property references: `todo.text` → `todo.title`, `todo.done` → `todo.completed`
- Added missing `<script>` block with `let { data } = $props()` so the page component receives `load()` data

### Commits

| SHA | Description |
|-----|-------------|
| `6a9ffe4` | `feat(todo-crud): add SvelteKit SSR todo app with SQLite` |
| `0505f23` | `feat: integrate SvelteKit SSR todo app with SQLite` |
| `fb96c14` | `fix(todo-ui): align form actions, field names and props with server` |
| `f6dc06a` | `fix: merge bugfix/todo-ui-action-mismatch — align UI form actions with server` |

### Dependencies

| Package | Version | Type |
|---------|---------|------|
| `better-sqlite3` | `^12.9.0` | production |
| `@sveltejs/kit` | `^2.57.1` | dev |
| `@sveltejs/adapter-auto` | `^7.0.1` | dev |
| `svelte` | `^5.55.3` | dev |
| `vite` | `^8.0.8` | dev |

---

*Generated from git history on `release/1.0.0` — 2026-04-14*
