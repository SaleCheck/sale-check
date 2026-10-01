# SaleCheck

Price-drop tracker. A user registers a product (URL + CSS selector for the price element + expected price). A weekly scheduled Cloud Function scrapes every product with Puppeteer, writes an execution record, and a Firestore trigger emails the user when the found price differs from the expected one.

## Tech Stack

- **Frontend** (repo root): React 19 + TypeScript (strict), Vite 7, React Router 7, Tailwind CSS 3, Headless UI, Heroicons
- **Backend** (`functions/`, git submodule → `SaleCheck/functions`): Node 22, CommonJS JavaScript, Firebase Functions (v1 + v2 APIs), firebase-admin, Puppeteer, Nodemailer (Gmail SMTP)
- **Platform**: Firebase Auth, Firestore, Cloud Storage, Hosting (SPA rewrite to `index.html`) — see `firebase.json`
- **Tests**: Mocha + Chai + Supertest + Sinon in `functions/`, run against the Firebase emulators. The frontend has no tests yet.

## Repository Layout

| Path | Purpose |
|---|---|
| `src/main.tsx` | Entry point; mounts `<App>` inside `BrowserRouter` |
| `src/App.tsx` | Layout shell (header, nav, footer), routes (`src/App.tsx:163`), login/signup modal |
| `src/pages/` | Route-level components (`Profile` is the only authenticated page) |
| `src/components/<Name>/<Name>.tsx` | Reusable UI: `Card`, `Modal`, `Spinner`, `Tooltip`, `Forms/*` |
| `src/services/` | The only modules that touch Firebase SDKs or `fetch` |
| `src/firebase/firebase.ts` | Single Firebase app init; exports `auth`, `db`, `storage`, `functions` |
| `functions/index.js` | Registers and re-exports every Cloud Function |
| `functions/auth/`, `functions/firestore/products/` | HTTP CRUD endpoints (users, products) |
| `functions/triggers/{auth,firestore}/` | Event-driven cleanup and sync (cascade deletes, user copy) |
| `functions/productPrices/` | Scheduled/on-demand scraping and the sale-notification trigger |
| `functions/utils/` | Shared helpers: `emailService.js`, `scrapeAndComparePricesAlgorithm.js` |
| `functions/contact/` | Contact form email endpoint (the only function the frontend calls) |
| `firestore.rules`, `storage.rules` | Owner-only security rules |
| `docs/` | Git submodule → GitHub wiki (Auth, Firestore CRUD, CI/CD, emulator guide) |
| `.github/workflows/` | Reusable workflows (audit → lint/format → test) chained into deploy-on-merge |

**Data model** (Firestore):
- `users/{uid}`
- `productsToCheck/{productId}`, owned through its `user` field
- `productsToCheck/{productId}/executions/{ISO timestamp}`, written by the scraper

Storage paths are `users/avatar/{uid}/` and `productImages/{productId}/`.

## Commands

Both packages are separate npm projects. Run `npm install` in the root and in `functions/`. After cloning, run `git submodule update --init` first.

**Frontend (repo root)**
```bash
npm run dev        # Vite dev server
npm run build      # Production build → dist/ (served by Firebase Hosting)
npm run lint       # ESLint (flat config, typescript-eslint, react-hooks)
npm run prettier   # Format src/
npm run emu        # firebase emulators:start (auth 9099, functions 5002, firestore 8080, storage 9199)
```

**Functions (`functions/`)**
```bash
npm run lint                                       # ESLint (also runs as predeploy hook)
firebase emulators:exec 'npm test'                 # Integration tests (what CI runs)
npm test                                           # Only works if emulators are already running
```
`npm test` runs only `functions/index.test.js`, which imports and invokes every `*.int.test.js` suite. It also fails if any exported function lacks a matching `<name>IntTest()` call (`functions/index.test.js:80`).

**Environment**: copy `.env.sample` → `.env` in both the root (`VITE_*` vars for the client) and `functions/` (non-prefixed Firebase vars + `EMAILUSER`/`EMAILAPPPWD`).

## Gotchas

- `functions/` and `docs/` are **submodules**. Changes there need their own commit/PR in the submodule repo, followed by a pointer bump ("chore: upd ref") in this repo.
- The frontend does **not** call the HTTP CRUD functions. It reads and writes Firestore/Storage directly through `src/services/*` and relies on `firestore.rules`/`storage.rules` for authorization. The HTTP endpoints (except `sendContactMessage`) exist for API/test use.
- Deleting a product or user cascades through triggers (`functions/triggers/`). Don't duplicate that cleanup client-side.
- `src/services/storageUserServce.ts` is misspelled on purpose (existing name). Import it as-is.
- The product field whitelist for the create endpoint lives in `functions/firestore/products/config/productsFirestoreStructureConfig.json`. Keep it in sync with `ProductData` in `src/services/firestoreProductService.ts:18`.

## Additional Documentation

Check these when the task touches the relevant area:

| File | When to read |
|---|---|
| `.claude/docs/architectural_patterns.md` | Before adding a page, component, service, Cloud Function, trigger, or test. Covers the conventions repeated across the codebase |
| `docs/Firestore.md` | Firestore CRUD flow, user-sync triggers, product endpoints |
| `docs/Auth.md` | Auth user endpoints (create/read/update/delete) |
| `docs/CICD.md` | Workflow sequence, required secrets, adding workflows |
| `docs/FirebaseEmulator.md` | Running emulators locally, importing production data |
| `docs/Home.md` | System overview / wiki index |

## Adding New Features or Fixing Bugs
**IMPORTANT**: When you work on a new feature or bug, create a git branch first. Then work on changes in that branch for the remainder of the session.
