# Zenith

Personal finance app (local ledger + Notion Expenses, Accounts, and Budgets read views). INR.

Zenith is a local-first Money Manager–style ledger (`zenith_v1_store`). **Notion** is a separate read-only source (Expenses, Accounts, Budgets). Expense Tracker owns writes to Notion — this app never changes the Notion schema and does not create or update Notion pages.

## Local ledger

Open `Zenith.html` (or `index.html`) in a browser, or serve the folder:

```bash
python3 -m http.server 5173 --bind 0.0.0.0
# http://127.0.0.1:5173/Zenith.html
```

With the API proxy (mock Notion data if env is missing):

```bash
node scripts/dev-server.js
```

## Notion Expenses (read path)

Prefer a **live Notion API query** against data source `collection://b35c3e74-0bc7-432d-8309-80a7583d3601` (paginated `POST /v1/data_sources/{id}/query`, fallback `POST /v1/databases/{id}/query`). This is not a one-shot export.

Database: [Expenses](https://app.notion.com/p/76941781c8ef4d258923b9c2a6750292). Schema fields mirrored in TypeScript (`lib/notion/schema.ts`):

| Property | Type |
| --- | --- |
| Name | title |
| Amount | number (rupee / INR). May be null (shown as ₹—, excluded from rollups) |
| Date | date (`Date`, YYYY-MM-DD) |
| Category | select: Food, Transport, Shopping, Bills, Health, Entertainment, Travel, Stay, Subscriptions, Other |
| Kind | select: Everyday, Travel, Receipt |
| Payment | select: UPI, Card, Cash, Other (instrument) |
| Account | select: Cash, IDFC (UPI/debit), Kamlesh UPI (wallet). Ignore `(inactive)*` and legacy UPI / Primary debit / Primary credit / Corporate |
| Status | select: Logged, Needs receipt, Submitted, Reimbursed |
| Trip | select: Vietnam Sep 2026, Varanasi Sep 2026, Other trip |
| Notes | text |
| Receipt | url |
| Reimbursable | checkbox (`true`/`false` or `__YES__`/`__NO__`) |

When `NOTION_TOKEN` is missing, the app uses **labeled example data** (10 real sample rows from Expense Tracker: Varanasi + Vietnam Sep 2026, including Vietnam Airlines with a null Amount). Notes start with “Example data”.

## Notion Accounts (read path)

Database: [Accounts](https://app.notion.com/p/a9effaa05c66492a9780b5a36cda1d63) (`collection://2c0de472-1d21-4243-bcd8-1fb19ab89bba`).

| Property | Type |
| --- | --- |
| Name | title — active: Cash, IDFC (UPI/debit), Kamlesh UPI. Rows starting `(inactive)` are hidden |
| Notes | text |
| Opening balance | number (rupee). Cash is ₹15,000 (Varanasi office float). IDFC still pending (null/0 → “Opening not set”). Kamlesh stays ₹0 |

**Active wallets**

- **Cash** — balance = opening − Cash-tagged expenses.
- **IDFC (UPI/debit)** — one IDFC First savings wallet (UPI + debit card). Same formula; opening pending.
- **Kamlesh UPI** — staff UPI on Raaghav’s behalf. **Spend totals only** — no wallet balance in the UI.

**Per-account balance** (Cash / IDFC) = Opening − priced Expenses tagged with that Account. Null Amounts are excluded. This app does not write opening balances. Hold merge until remaining openings are filled (or Raaghav says merge anyway).

`GET /api/accounts` returns `{ source, accounts, balances }`.

## Notion Budgets (read path)

Database: [Budgets](https://app.notion.com/p/301bb78c3c094fb1aee38bcb57f7beb0) (`collection://3f8d31df-d13d-49a2-a9ac-f5b8489f737f`).

| Property | Type |
| --- | --- |
| Name | title |
| Category | select — same enums as Expenses |
| Monthly cap | number (rupee) |
| Notes | text |

**Left this month** = Monthly cap − this-month spend in that Category. Caps with no value show spend only (no progress bar).

`GET /api/budgets` returns `{ source, budgets, progress, monthKey }`.

Share **Accounts**, **Budgets**, and **Expenses** with the same Notion integration for live data.

### Environment variables

Copy `.env.example` and fill in a Notion internal integration token that can **read** the Expenses, Accounts, and Budgets databases (share each DB with the integration).

| Variable | Required | Description |
| --- | --- | --- |
| `NOTION_TOKEN` | yes (for live data) | Notion integration secret. Also accepted: `NOTION_API_KEY`. |
| `NOTION_EXPENSES_DATA_SOURCE_ID` | recommended | Data source id `b35c3e74-0bc7-432d-8309-80a7583d3601` |
| `NOTION_EXPENSES_DATABASE_ID` | fallback | Database id `76941781c8ef4d258923b9c2a6750292` |
| `NOTION_ACCOUNTS_DATA_SOURCE_ID` | no | Defaults to `2c0de472-1d21-4243-bcd8-1fb19ab89bba` |
| `NOTION_ACCOUNTS_DATABASE_ID` | no | Defaults to `a9effaa05c66492a9780b5a36cda1d63` |
| `NOTION_BUDGETS_DATA_SOURCE_ID` | no | Defaults to `3f8d31df-d13d-49a2-a9ac-f5b8489f737f` |
| `NOTION_BUDGETS_DATABASE_ID` | no | Defaults to `301bb78c3c094fb1aee38bcb57f7beb0` |
| `NOTION_EXPENSES_USE_MOCK` / `NOTION_USE_MOCK` | no | Set to `1` to force example data even when a token is present |
| `SARVAM_API_KEY` | no | Sarvam Saaras STT (`api-subscription-key`). Alias: `SARVAM_API_SUBSCRIPTION_KEY`. REST `https://api.sarvam.ai/speech-to-text`, model `saaras:v3`, clips under 30s. If unset, the mic is disabled with a tip; you can still log manually. |
| `GOOGLE_CLOUD_VISION_API_KEY` | no | Cloud Vision `DOCUMENT_TEXT_DETECTION` via `images:annotate` (free tier, first ~1,000 units/month). Alias: `GOOGLE_VISION_API_KEY`. **Do not use Document AI** (paid parser). This app uses an **API key**, not a service-account JWT. `GOOGLE_APPLICATION_CREDENTIALS` is ignored — create a Cloud Vision API key in Google Cloud and restrict it to the Vision API. If unset, you can still attach a compressed photo locally without OCR. |

The token and API keys must stay on the server. The browser calls `GET /api/expenses`, `GET /api/accounts`, `GET /api/budgets`, `GET /api/status`, `POST /api/voice`, and `POST /api/ocr` only.

If env is missing (GitHub Pages, local static server), the UI shows **example data** for Notion and disables live voice/OCR.

### Vercel

This repo can ship as static files plus `api/expenses.js`, `api/accounts.js`, `api/budgets.js`, `api/status.js`, `api/voice.js`, and `api/ocr.js`.

1. Import the GitHub repo in Vercel.
2. Set `NOTION_TOKEN` and `NOTION_EXPENSES_DATA_SOURCE_ID` in the project env. Account/Budget source ids have defaults. Optionally set `SARVAM_API_KEY` and `GOOGLE_CLOUD_VISION_API_KEY`.
3. Deploy. Open the app: **Home** shows account cards and left-this-month; **Activity → Notion** is still the Expenses list; **Plan** and **You** open Notion budgets/accounts.

GitHub Pages cannot keep a secret; without Vercel (or `node scripts/dev-server.js` + env) you only get mock Notion mode and local photo attach.

## Tests

```bash
npm test
```

## Navigation

- **Home** — local spent-this-month, Notion Expenses card, account balances, left-this-month
- **Activity** — Local ledger vs Notion Expenses
- **Plan** — Notion budgets (left this month) plus local budgets/goals
- **+** — Voice (Sarvam), Scan (Vision / local photo), Manual
- **You** — Notion Expenses, Accounts, and Budgets rows
