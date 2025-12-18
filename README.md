# Sugran — Recipe API

Minimal Next.js API-only project to store and serve recipes. Designed to be called from `noshnurture` via HTTP.

Quick start

1. Install dependencies

```bash
cd sugran
npm install
```

2. Seed (already included) or re-seed

```bash
npm run seed # not required; db/recipes.json is pre-populated
```

3. Run dev server

```bash
npm run dev
# server listens on http://localhost:3006
```

API endpoints

- GET /api/recipes -> { count, results }
  - query params: `cuisine`, `q`, `limit`
- GET /api/recipes/:id -> { recipe }
- POST /api/recipes -> create recipe (JSON body)
- POST /api/recipes/search -> body: { inventory: ["tomato","onion"], cuisine: "Maharashtrian", limit: 10 }

CLI

- Add recipes interactively with:

```bash
npm run add-recipe
# follows prompts to add a recipe to db/recipes.json
```

Notes

- Database is a simple JSON file at `db/recipes.json` for quick iteration.
- The project intentionally avoids external DB dependencies for now; if you prefer SQLite or Postgres I can add Prisma or Knex and migration scripts.
