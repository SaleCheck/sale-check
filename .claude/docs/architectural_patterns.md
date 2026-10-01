# Architectural Patterns & Conventions

This file lists only patterns that appear in more than one file. Follow them when adding code, unless the task is specifically to change them.

---

## Frontend (`src/`)

### 1. Service layer wraps every Firebase/network call
Components and pages never call Firebase SDK functions directly. They only import SDK *types*, such as `type User`. All I/O goes through small, named-export functions in `src/services/`:
- Auth: `src/services/authService.ts:18-47`
- Firestore: `src/services/firestoreProductService.ts:35-80`, `src/services/firestoreUserService.ts:16-34`
- Storage: `src/services/storageUserServce.ts:4-25`
- HTTP function call: `src/services/contactEmailService.ts:10-21`

Consumers: `src/App.tsx:15`, `src/pages/Profile.tsx:8-16`, `src/components/Forms/LoginForm.tsx:3`, `src/components/Forms/SignupForm.tsx:3-8`, `src/pages/Contact.tsx:2`.

Each service file also exports the TypeScript interfaces for its data (`ProductData`/`Product` at `firestoreProductService.ts:18-33`, `UserData` at `firestoreUserService.ts:4-14`). Pages import those types instead of redefining them.

### 2. Single Firebase app instance
`src/firebase/firebase.ts:17-22` initializes the app once and exports `auth`, `db`, `storage` and `functions`. Only services import from it. Config comes from `VITE_`-prefixed env vars (`src/firebase/firebase.ts:7-15`).

### 3. Auth state: subscribe per component, no global store
There is no Context, Redux or similar. Any component that needs the user subscribes in `useEffect` and returns the unsubscribe function:
- `src/App.tsx:24-32`
- `src/pages/Profile.tsx:54-85`

All state is local `useState` with explicit generic types, for example `useState<boolean>(false)`.

### 4. Page title set on mount
Each route component sets `document.title = 'SaleCheck | <Page>'` in a mount `useEffect`. Examples: `src/App.tsx:25`, `src/pages/Profile.tsx:55`, `src/pages/Contact.tsx:12`.

### 5. Component structure
- One component per folder: `src/components/<Name>/<Name>.tsx` (forms are grouped under `Forms/`).
- `interface <Name>Props` sits directly above a `export default function <Name>(...)` that destructures its props. See `Card.tsx:9-25`, `Modal.tsx:5-11`, `LoginForm.tsx:5-13`, `SignupForm.tsx:10-25`, `ProductForm.tsx:4-46`.
- Optional props get defaults in the destructuring (`ProductForm.tsx:35-45`).
- Headless UI `Transition`/`Dialog` handles animation and overlays (`Modal.tsx:13-53`, `Card.tsx:27-33`, `App.tsx:136-159`).

### 6. Modal + presentational form; the parent owns persistence
`Modal` is a generic shell that takes `isOpen`, `closeModal` and `children` (`Modal.tsx:5-11`). Forms get `closeModal` and callbacks as props. A form collects values and passes them up. The parent page calls the services.
- Login/Signup switching: `src/App.tsx:210-222`
- `ProductForm` reused for create and edit through props and `onSubmit({ productId, productImageFile, values })`: `src/pages/Profile.tsx:244-277`, contract at `ProductForm.tsx:17-29`
- Confirmation dialog built inline in a `Modal`: `src/pages/Profile.tsx:280-315`

### 7. Async handler shape
Every submit/mutation handler follows the same shape:
1. `preventDefault`
2. Reset the error and set the loading flag
3. `try` the await
4. `catch` → set the error message or `console.error`
5. `finally` → clear the loading flag

See `LoginForm.tsx:21-38`, `SignupForm.tsx:37-88`, `ProductForm.tsx:56-86`, `Contact.tsx:30-41`, `Profile.tsx:104-197`. Submit buttons are disabled while the flag is set and show an "...ing" label.

After a mutation, `Profile` reloads with `navigate(0)` instead of patching local state (`Profile.tsx:137`, `:175`, `:191`).

### 8. Two-phase writes for uploaded images
Create or obtain the entity ID first. Then upload to a Storage path keyed by that ID. Then write the download URL back to the document.
- Products: `src/pages/Profile.tsx:119-134` (create) and `:158-172` (edit)
- Avatars: `src/components/Forms/SignupForm.tsx:49-71`

Storage paths are `users/avatar/{uid}/{uid}.png` and `productImages/{productId}/{productId}.png` (`storageUserServce.ts:8`, `:20`). Image upload failures are logged but don't fail the parent operation.

### 9. Timestamps on every write
Client writes add `lastUpdated: serverTimestamp()`, plus `createdTimestamp` on create: `firestoreProductService.ts:59-60`, `:73`, `firestoreUserService.ts:30`. User documents use `setDoc(..., { merge: true })` (`firestoreUserService.ts:33`).

---

## Backend (`functions/`)

### 10. One function per file, aggregated in `index.js`
Each file exports `exports.<functionName> = onRequest(...)` or a trigger. `functions/index.js:18-63` `require`s each module and re-exports it under the same name. A new function must be added there **and** get a `<name>IntTest` (see §15).

### 11. Module-level Admin SDK handles
The Admin app is initialized once in `functions/index.js:15-16`. Each module grabs its client at module scope: `const db = getFirestore()` / `admin.firestore()` / `admin.storage().bucket()`. Examples: `createProductToCheck.js:6`, `getProductToCheck.js:5`, `onProductSaleCheckExecution.js:6`, `onUserCreatedCopyToFirestore.js:5`, `onProductDeletedDeleteFromStorage.js:4`, `utils/scrapeAndComparePricesAlgorithm.js:4`.

### 12. HTTP endpoint template (v2 `onRequest`)
All HTTP functions follow the same guard sequence inside a `cors({ origin: true })` wrapper:
1. Method check → `405 { success: false, error }`
2. `Content-Type: application/json` check → `400` (for bodies)
3. Required field/param check → `400 { success: false, error }`
4. `try` the work → `2xx`; `catch` → `500 { status: 'Internal Server Error', error }`

Examples: `functions/firestore/products/createProductToCheck.js:8-60`, `functions/firestore/products/getProductToCheck.js:7-36`, `functions/auth/deleteUser.js:5-39`, `functions/contact/sendContactMessage.js:5-45`.

Heavier endpoints pass runtime options as the first argument, e.g. `{ timeoutSeconds: 300, memory: '1GiB' }` (`createProductToCheck.js:9`, `sendContactMessage.js:6`).

Request bodies are wrapped as `{ data: {...} }` (`createProductToCheck.js:25`, `sendContactMessage.js:21`, client side `contactEmailService.ts:14`). Some auth endpoints read the body directly (`deleteUser.js:18`). Check the neighbouring endpoint before choosing.

### 13. Whitelisted payload fields
Product creation validates and filters input against a JSON whitelist (`functions/firestore/products/config/productsFirestoreStructureConfig.json`, used at `createProductToCheck.js:4`, `:31-45`). The tests import the same list (`createProductToCheck.int.test.js:7`).

### 14. Triggers: v1 API + extracted testable helper
Event triggers use `firebase-functions/v1` (`functions.auth.user().onCreate`, `functions.firestore.document(...).onDelete/onCreate`). The business logic lives in a plain async function. The trigger is a thin wrapper, and the helper is exported as `exports._test = { helper }` for tests:
- `functions/triggers/auth/onUserCreatedCopyToFirestore.js:7-37`
- `functions/triggers/firestore/onProductDeletedDeleteFromStorage.js:6-48`
- Same pattern in `onUserDeletedDeleteFromFirestore.js` and `onUserDeletedDeleteProductsFromFirestore.js`
- Test usage: `onProductDeletedDeleteFromStorage.int.test.js:3`, `:44`

Cascading cleanup (user → products → storage files) is done by these triggers, not by callers.

### 15. Event-sourced price checks
Scraping and notification are decoupled through a subcollection:
1. `utils/scrapeAndComparePricesAlgorithm.js:47-58` writes `productsToCheck/{id}/executions/{ISO timestamp}` with `foundPrice` and `samePriceAsExpected`.
2. `productPrices/onProductSaleCheckExecution.js:8-10` reacts `onCreate`, emails the user, and writes `emailStatus` back onto the execution doc (`:84-92`).
3. Entry points share a single runner: scheduled (`scrapeAndComparePrices.js:60-79`) and on-demand HTTP (`:82-105`).

### 16. Email via shared service, with admin alerting
All mail goes through `functions/utils/emailService.js:14-24` (`sendEmail(mailOptions)`, which rethrows on failure). Failures in background jobs send an alert email to `process.env.EMAILUSER`: `scrapeAndComparePrices.js:35-55`, `onProductSaleCheckExecution.js:117-139`. Error text placed into HTML is escaped (`onProductSaleCheckExecution.js:106`).

### 17. Integration tests colocated, aggregated, emulator-backed
- `<name>.int.test.js` sits next to `<name>.js` and exports `exports.<name>IntTest = () => { describe(...) }` (for example `createProductToCheck.int.test.js:16`).
- `functions/index.test.js:1-26` points the Admin SDK at the emulators using ports from `firebase.json`, then imports and invokes every suite (`:28-78`).
- A meta-test fails if any export in `index.js` has no matching `<name>IntTest()` call (`index.test.js:80-105`). The `skipFunctions` list there is a temporary escape hatch.
- HTTP functions are tested by mounting the handler on an Express app and driving it with Supertest (`createProductToCheck.int.test.js:12-14`, `:36-52`). Created docs are removed in `afterEach` (`:31-34`).

---

## Cross-cutting

### 18. Ownership-based authorization
Every product document carries `user: <uid>`. The security rules enforce owner-only access on that field: `firestore.rules:6-15` (products), `:18-20` (users), `storage.rules:14-18` (product images look up the owning product via `firestore.get`). Client queries filter on the same field (`firestoreProductService.ts:37`). Any new collection should follow the same owner-field model and get a matching rule.

### 19. Configuration through env vars
- Client: `import.meta.env.VITE_*` (`src/firebase/firebase.ts:8-14`)
- Functions: `process.env.*` loaded by `dotenv` (`functions/index.js:1-14`, `functions/utils/emailService.js:9-10`, `functions/.mocharc.js:2`)

Secrets are never hardcoded. CI injects them from GitHub secrets (`.github/workflows/deploy-functions-on-merge.yml`).

### 20. CI as reusable workflow chain
`npm-audit-on-pr.yml` → `formatting-linting-on-pr.yml` → `npm-test-on-pr.yml` are reusable workflows (parameterized by `working-directory`). The deploy workflows compose them (`deploy-functions-on-merge.yml`, `deploy-hosting-on-merge.yml`). Tests run under `firebase emulators:exec 'npm test'` (`npm-test-on-pr.yml:105`).
