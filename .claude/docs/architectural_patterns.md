# Architectural Patterns & Conventions

This file lists only patterns that appear in more than one file. Follow them when adding code, unless the task is specifically to change them.

---

## Frontend (`src/`)

### 1. Service layer wraps every Firebase/network call; hooks are its only callers
All I/O goes through small, named-export functions in `src/services/`:
- Auth: `src/services/authService.ts`
- Firestore: `src/services/firestoreProductService.ts`, `src/services/firestoreUserService.ts`
- Storage: `src/services/storageUserServce.ts`
- HTTP function call: `src/services/contactEmailService.ts`

Only hooks in `src/hooks/` import service functions. There are no exceptions: a page or component that needs data or a write gets a hook, even when only one place uses it. Pages and components never call Firebase SDK functions or services directly. They only import SDK *types*, such as `type User`.

Each service file also exports the TypeScript interfaces for its data (`ProductData`/`Product` in `firestoreProductService.ts`, `UserData` in `firestoreUserService.ts`). Pages import those types instead of redefining them.

### 2. Data hooks over TanStack Query
`src/hooks/` has one file per domain, mirroring the service grouping:
- `useAuth.ts`: `useAuthUser`, `useLogin`, `useSignup`, `useLogout`
- `useUser.ts`: `userKeys`, `useUserDoc`, `useUpdateUserProfile`, `useUpdateAvatar`
- `useProducts.ts`: `productKeys`, `useProducts`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`
- `useContact.ts`: `useSendContactMessage`

Conventions:
- **Reads** are `useQuery` hooks keyed through a colocated key factory (`userKeys.detail(uid)` → `['users', uid]`, `productKeys.list(uid)` → `['products', uid]`), with `enabled: !!uid`. Components that read the same key share one cache entry. For example, `App.tsx` and `Profile.tsx` both call `useUserDoc`.
- **Writes** are `useMutation` hooks. A multi-step write (upload → auth profile → Firestore doc) lives entirely in `mutationFn`. `onSuccess` returns `queryClient.invalidateQueries(...)` for the affected key, so `mutateAsync` resolves only after the refetch has started.
- Wrap services in `mutationFn` (`(id: string) => deleteProductForUser(id)`) rather than passing them directly. TanStack v5 calls `mutationFn` with a second context argument.
- Hooks take what they need as arguments (`user` or `uid`). They don't subscribe to auth themselves.
- Tests sit next to the hook (`useX.test.tsx`). They use `renderHook` with a `QueryClientProvider` wrapper and mock the services with `vi.mock` + `vi.mocked(...)`.

### 3. Single Firebase app instance
`src/firebase/firebase.ts:17-22` initializes the app once and exports `auth`, `db`, `storage` and `functions`. Only services import from it. Config comes from `VITE_`-prefixed env vars (`src/firebase/firebase.ts:7-15`).

### 4. Auth state via `useAuthUser`
There is no Context, Redux or similar. Any component that needs the user calls `useAuthUser()` (`src/hooks/useAuth.ts:32`). It returns `{ user, loading }` and owns the subscribe/unsubscribe lifecycle. Consumers: `src/App.tsx:46`, `src/pages/Profile.tsx:31`.

Sign-out doesn't clear user state by hand. `onAuthStateChanged` emits `null` and every `useAuthUser` updates.

UI state is local `useState` with explicit generic types, for example `useState<boolean>(false)`.

### 5. Page title set on mount
Each route component sets `document.title = 'SaleCheck | <Page>'` in a mount `useEffect`. This stays in the page, not in a hook. Examples: `src/App.tsx:53`, `src/pages/Profile.tsx:48`, `src/pages/Contact.tsx:11`.

### 6. Component structure
- One component per folder: `src/components/<Name>/<Name>.tsx` (forms are grouped under `Forms/`).
- `interface <Name>Props` sits directly above a `export default function <Name>(...)` that destructures its props. See `Card.tsx:9-18`, `Modal.tsx:5-11`, `LoginForm.tsx`, `SignupForm.tsx`, `ProductForm.tsx:4-46`.
- Optional props get defaults in the destructuring (`ProductForm.tsx:35-45`).
- Headless UI `Transition`/`Dialog`/`Menu` handles animation, overlays and dropdowns (`Modal.tsx`, `Card.tsx`, the avatar menu in `App.tsx`).

### 7. Modal + presentational form; the parent wires a mutation hook
`Modal` is a generic shell that takes `isOpen`, `closeModal` and `children` (`Modal.tsx:5-11`). It already renders the close (X) button. Forms get `closeModal` and an `onSubmit` callback as props, and collect values and pass them up. The parent connects `onSubmit` to a mutation hook:
- Directly: `onSubmit={updateAvatar.mutateAsync}` (`src/App.tsx:327`), `onSubmit={updateUserProfile.mutateAsync}` (`:315`)
- Through a small handler that also closes the modal: `handleCreate`/`handleEdit`/`handleDelete` in `src/pages/Profile.tsx:69-104`
- `ProductForm` is reused for create and edit through props, with the contract `onSubmit({ productId, productImageFile, values })` (`ProductForm.tsx:17-29`)
- A confirmation dialog is built inline in a `Modal` (delete product in `Profile.tsx`)

Form action buttons follow `ProductForm.tsx:199-218`: a centred row with gray **Cancel** first and the coloured submit second. Both are `px-4 py-2 rounded-md`, and the submit gets `opacity-50 cursor-not-allowed` while disabled.

### 8. Async handler shape (forms)
Every form submit handler follows the same shape:
1. `preventDefault`
2. Reset the error and set the loading flag
3. `try` the await (`onSubmit(...)` or `mutation.mutateAsync(...)`)
4. `catch` → set the error message or `console.error`
5. `finally` → clear the loading flag

See `LoginForm.tsx:22`, `SignupForm.tsx:26`, `ProductForm.tsx:56`, `AvatarForm.tsx:32`, `EditUserForm.tsx:26`. Submit buttons are disabled while the flag is set and show an "...ing" label. Pages that don't own a form read the mutation state instead (`deleteProduct.isPending`, `status` in `Contact.tsx`).

After a write, the UI refreshes through query invalidation in the mutation's `onSuccess` (§2). Don't reload the page or patch local state.

### 9. Two-phase writes for uploaded images
Create or obtain the entity ID first. Then upload to a Storage path keyed by that ID. Then write the download URL back to the document. These chains live in the mutation hooks:
- Products: `useCreateProduct` (create → upload → `imageUrl`) and `useUpdateProduct` in `src/hooks/useProducts.ts`
- Avatars: `useSignup` in `src/hooks/useAuth.ts`, `useUpdateAvatar` in `src/hooks/useUser.ts`

Storage paths are `users/avatar/{uid}/{uid}.png` and `productImages/{productId}/{productId}.png` (`storageUserServce.ts:8`, `:20`). Product image upload failures are logged but don't fail the parent operation. An avatar upload failure does fail `useUpdateAvatar`, because the upload is the whole point of that action.

### 10. Timestamps on every write
Client writes add `lastUpdated: serverTimestamp()`, plus `createdTimestamp` on create: `firestoreProductService.ts`, `firestoreUserService.ts`. User documents use `setDoc(..., { merge: true })`.

---

## Backend (`functions/`)

### 11. One function per file, aggregated in `index.js`
Each file exports `exports.<functionName> = onRequest(...)` or a trigger. `functions/index.js:18-63` `require`s each module and re-exports it under the same name. A new function must be added there **and** get a `<name>IntTest` (see §18).

### 12. Module-level Admin SDK handles
The Admin app is initialized once in `functions/index.js:15-16`. Each module grabs its client at module scope: `const db = getFirestore()` / `admin.firestore()` / `admin.storage().bucket()`. Examples: `createProductToCheck.js:6`, `getProductToCheck.js:5`, `onProductSaleCheckExecution.js:6`, `onUserCreatedCopyToFirestore.js:5`, `onProductDeletedDeleteFromStorage.js:4`, `utils/scrapeAndComparePricesAlgorithm.js:4`.

### 13. HTTP endpoint template (v2 `onRequest`)
All HTTP functions follow the same guard sequence inside a `cors({ origin: true })` wrapper:
1. Method check → `405 { success: false, error }`
2. `Content-Type: application/json` check → `400` (for bodies)
3. Required field/param check → `400 { success: false, error }`
4. `try` the work → `2xx`; `catch` → `500 { status: 'Internal Server Error', error }`

Examples: `functions/firestore/products/createProductToCheck.js:8-60`, `functions/firestore/products/getProductToCheck.js:7-36`, `functions/auth/deleteUser.js:5-39`, `functions/contact/sendContactMessage.js:5-45`.

Heavier endpoints pass runtime options as the first argument, e.g. `{ timeoutSeconds: 300, memory: '1GiB' }` (`createProductToCheck.js:9`, `sendContactMessage.js:6`).

Request bodies are wrapped as `{ data: {...} }` (`createProductToCheck.js:25`, `sendContactMessage.js:21`, client side `contactEmailService.ts:14`). Some auth endpoints read the body directly (`deleteUser.js:18`). Check the neighbouring endpoint before choosing.

### 14. Whitelisted payload fields
Product creation validates and filters input against a JSON whitelist (`functions/firestore/products/config/productsFirestoreStructureConfig.json`, used at `createProductToCheck.js:4`, `:31-45`). The tests import the same list (`createProductToCheck.int.test.js:7`).

### 15. Triggers: v1 API + extracted testable helper
Event triggers use `firebase-functions/v1` (`functions.auth.user().onCreate`, `functions.firestore.document(...).onDelete/onCreate`). The business logic lives in a plain async function. The trigger is a thin wrapper, and the helper is exported as `exports._test = { helper }` for tests:
- `functions/triggers/auth/onUserCreatedCopyToFirestore.js:7-37`
- `functions/triggers/firestore/onProductDeletedDeleteFromStorage.js:6-48`
- Same pattern in `onUserDeletedDeleteFromFirestore.js` and `onUserDeletedDeleteProductsFromFirestore.js`
- Test usage: `onProductDeletedDeleteFromStorage.int.test.js:3`, `:44`

Cascading cleanup (user → products → storage files) is done by these triggers, not by callers.

### 16. Event-sourced price checks
Scraping and notification are decoupled through a subcollection:
1. `utils/scrapeAndComparePricesAlgorithm.js:47-58` writes `productsToCheck/{id}/executions/{ISO timestamp}` with `foundPrice` and `samePriceAsExpected`.
2. `productPrices/onProductSaleCheckExecution.js:8-10` reacts `onCreate`, emails the user, and writes `emailStatus` back onto the execution doc (`:84-92`).
3. Entry points share a single runner: scheduled (`scrapeAndComparePrices.js:60-79`) and on-demand HTTP (`:82-105`).

### 17. Email via shared service, with admin alerting
All mail goes through `functions/utils/emailService.js:14-24` (`sendEmail(mailOptions)`, which rethrows on failure). Failures in background jobs send an alert email to `process.env.EMAILUSER`: `scrapeAndComparePrices.js:35-55`, `onProductSaleCheckExecution.js:117-139`. Error text placed into HTML is escaped (`onProductSaleCheckExecution.js:106`).

### 18. Integration tests colocated, aggregated, emulator-backed
- `<name>.int.test.js` sits next to `<name>.js` and exports `exports.<name>IntTest = () => { describe(...) }` (for example `createProductToCheck.int.test.js:16`).
- `functions/index.test.js:1-26` points the Admin SDK at the emulators using ports from `firebase.json`, then imports and invokes every suite (`:28-78`).
- A meta-test fails if any export in `index.js` has no matching `<name>IntTest()` call (`index.test.js:80-105`). The `skipFunctions` list there is a temporary escape hatch.
- HTTP functions are tested by mounting the handler on an Express app and driving it with Supertest (`createProductToCheck.int.test.js:12-14`, `:36-52`). Created docs are removed in `afterEach` (`:31-34`).

---

## Cross-cutting

### 19. Ownership-based authorization
Every product document carries `user: <uid>`. The security rules enforce owner-only access on that field: `firestore.rules:6-15` (products), `:18-20` (users), `storage.rules:14-18` (product images look up the owning product via `firestore.get`). Client queries filter on the same field (`firestoreProductService.ts:37`). Any new collection should follow the same owner-field model and get a matching rule.

### 20. Configuration through env vars
- Client: `import.meta.env.VITE_*` (`src/firebase/firebase.ts:8-14`)
- Functions: `process.env.*` loaded by `dotenv` (`functions/index.js:1-14`, `functions/utils/emailService.js:9-10`, `functions/.mocharc.js:2`)

Secrets are never hardcoded. CI injects them from GitHub secrets (`.github/workflows/deploy-functions-on-merge.yml`).

### 21. CI as reusable workflow chain
`npm-audit-on-pr.yml` → `formatting-linting-on-pr.yml` → `npm-test-on-pr.yml` are reusable workflows (parameterized by `working-directory`). The deploy workflows compose them (`deploy-functions-on-merge.yml`, `deploy-hosting-on-merge.yml`). Tests run under `firebase emulators:exec 'npm test'` (`npm-test-on-pr.yml:105`).
