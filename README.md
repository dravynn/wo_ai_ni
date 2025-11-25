# Mini LiqPass Quote API

Small TypeScript + Node.js service that exposes two endpoints to create and fetch simple insurance-like quotes and persists them in SQLite.

Quick start

1. Install

```
npm install
```

2. Run (development)

```
npm run dev
```

3. Build + run

```
npm run build
npm start
```

Run tests

```
npm test
```

Example curl requests

Create a quote:

```
curl -X POST http://localhost:3000/quote \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice","principal":1000,"leverage":10,"durationHours":24}'
```

Fetch quotes for a user:

```
curl http://localhost:3000/quotes/alice
```

Notes
- The SQLite DB file is created at `./data/quotes.db` by default. You can override with `DB_PATH` env var.
- Validation is implemented with `zod`.
