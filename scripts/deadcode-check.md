## Lint & Dead Code Commands

Run from the repository root unless stated otherwise.

- `npm run lint:deadcode:backend` – ESLint over all backend `.js` files.
- `npm run lint:deadcode:frontend` – ESLint over frontend `src/**/*.js,jsx`.
- `npm run lint:deadcode:all` – convenience wrapper that runs both commands.
- `npm run depcheck:backend` – checks backend dependencies for unused/missing entries.
- `npm run depcheck:frontend` – same for the frontend workspace.

> Tip: These rely on flat ESLint configs, so no extra CLI flags are necessary.

