# Esencia Magnética

Fashion & lifestyle website for women 40–55+. Drives traffic to YouTube and monetizes through affiliate links.

Built with **Astro** · **TypeScript** · **Tailwind CSS v4** · **Sanity CMS**.

---

## Requirements

- [Node.js](https://nodejs.org/) v22 (run `nvm use` if you have nvm)
- [pnpm](https://pnpm.io/) v11+

## Setup

```bash
git clone https://github.com/arsistyle/esencia-magnetica.git
cd esencia-magnetica
cp .env.example .env   # fill in your keys
pnpm install
pnpm dev
```

Open `http://localhost:4321`.

## Scripts

| Script            | Description                        |
| ----------------- | ---------------------------------- |
| `pnpm dev`        | Start dev server at localhost:4321 |
| `pnpm build`      | Build static output to `dist/`     |
| `pnpm preview`    | Preview the built output           |
| `pnpm typecheck`  | TypeScript type check              |
| `pnpm lint`       | Run ESLint                         |
| `pnpm lint:fix`   | Run ESLint and auto-fix            |
| `pnpm format`     | Format all files with Prettier     |
| `pnpm test`       | Run unit tests (Vitest)            |
| `pnpm test:watch` | Run Vitest in watch mode           |

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable                    | Used in  | Description            |
| --------------------------- | -------- | ---------------------- |
| `PUBLIC_SANITY_PROJECT_ID`  | Stage 03 | Sanity project ID      |
| `PUBLIC_SANITY_DATASET`     | Stage 03 | Sanity dataset name    |
| `SANITY_API_READ_TOKEN`     | Stage 03 | Server-only read token |
| `PUBLIC_GA4_MEASUREMENT_ID` | Stage 09 | Google Analytics 4 ID  |

## Project Structure

```
src/
├── components/   Reusable Astro components
├── layouts/      Page layouts (BaseLayout.astro)
├── lib/          TypeScript utilities
├── pages/        Routes (file-based)
├── styles/       Global CSS (Tailwind entry)
└── content/      Content collections (Stage 03)
```

## Documentation

- [Implementation Plan](docs/PLAN.md)
- [Project Definition](docs/PROJECT.md)
- [Brand & Audience](docs/ABOUT.md)
