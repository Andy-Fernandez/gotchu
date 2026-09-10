# Verification layers

- `unit/`: pure scheduling, money, state-transition, and policy rules.
- `integration/`: transactions, concurrency, idempotency, authorization, storage, and adapter boundaries.
- `e2e/`: complete customer, staff, financial-review, and owner stories.

The first unit tests cover the public catalog in `unit/catalog.test.ts`. Run `pnpm test` with Node.js 24, using its built-in test runner and native TypeScript support; no additional test dependencies are installed. Explicit `.ts` imports work in Node and are allowed by the application's TypeScript configuration. Run `pnpm typecheck` separately because Node strips types without checking them.

Integration and end-to-end tooling will be added when those behaviors are implemented.
