# Zenith

Personal finance app (local ledger + Notion Expenses read view). INR.

Zenith is a local-first Money Manager–style ledger (`zenith_v1_store`). **Notion Expenses** is a separate read-only source. Expense Tracker owns writes to Notion — this app never changes the Notion schema and does not create or update Notion pages.

## Local ledger

Open `Zenith.html` (or `index.html`) in a browser, or serve the folder:

```bash
python3 -m http.server 5173 --bind 0.0.0.0
# http://127.0.0.1:5173/Zenith.html
```

With the Notion API proxy (mock data if env is missing):

```bash
node scripts/dev-server.js
```

## Notion Expenses (read path)

The Notion database is [Expenses](https://app.notion.com/p/76941781c8ef4d258923b9c2a6750292) (`collection://b35c3e74-0bc7-432d-8309-80a7583d3601`). Schema fields mirrored in TypeScript (`lib/notion/schema.ts`):

| Property | Type |
| --- | --- |
| Name | title |
| Amount | number (rupee / INR) |
| Date | date |
| Category | select: Food, Transport, Shopping, Bills, Health, Entertainment, Travel, Stay, Subscriptions, Other |
| Kind | select: Everyday, Travel, Receipt |
| Payment | select: UPI, Card, Cash, Other (instrument) |
| Account | select: Cash, UPI, Primary debit, Primary credit, Corporate (wallet) |
| Status | select: Logged, Needs receipt, Submitted, Reimbursed |
| Trip | select: Vietnam Sep 2026, Varanasi Sep 2026, Other trip |
| Notes | text |
| Receipt | url |
| Reimbursable | checkbox |

### Environment variables

Copy `.env.example` and fill in a Notion internal integration token that can **read** the Expenses database (share the DB with the integration).

| Variable | Required | Description |
| --- | --- | --- |
| `NOTION_TOKEN` | yes (for live data) | Notion integration secret. Also accepted: `NOTION_API_KEY`. |
| `NOTION_EXPENSES_DATA_SOURCE_ID` | recommended | Data source id `b35c3e74-0bc7-432d-8309-80a7583d3601` |
| `NOTION_EXPENSES_DATABASE_ID` | fallback | Database id `76941781c8ef4d258923b9c2a6750292` |
| `NOTION_EXPENSES_USE_MOCK` | no | Set to `1` to force example data even when a token is present |

The token must stay on the server. The browser calls `GET /api/expenses` only.

If env is missing (GitHub Pages, local static server), the UI shows **example data** and explains how to wire Notion.

### Vercel

This repo can ship as static files plus `api/expenses.js`.

1. Import the GitHub repo in Vercel.
2. Set `NOTION_TOKEN` and `NOTION_EXPENSES_DATA_SOURCE_ID` in the project env.
3. Deploy. Open the app and use **Activity → Notion** or Home → Notion Expenses.

GitHub Pages cannot keep a secret; without Vercel (or `node scripts/dev-server.js` + env) you only get mock mode.

## Tests

```bash
node scripts/test-notion-expenses.js
```

## Navigation

- **Home** — local spent-this-month, plus a Notion Expenses card
- **Activity** — Local ledger vs Notion toggle
- **You** — Notion Expenses row
