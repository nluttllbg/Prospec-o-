# Prospecta — Prospecção inteligente

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm build:static`: build only the frontend for static hosts such as GitHub Pages.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the frontend on every push to `main`. The expected project URL is `https://nluttllbg.github.io/Prospec-o-/`.

GitHub Pages serves the static interface only. The Express/tRPC backend, Google Places proxy, authentication and server-side integrations continue to run on the Manus deployment at `https://prospecta-pgopewdb.manus.space`.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
