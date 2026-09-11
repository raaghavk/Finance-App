# Zenith

Personal finance app. INR. Cool blue. Your expenses and account balances are saved **on this device** (`localStorage`, key `zenith_v1_store`). No Notion or other remote database is required.

## Install on iPhone

Use this link only: **https://zenith-raaghavks-projects.vercel.app**

Safari will not install from `http://localhost`. After it opens:

1. Tap **Share**
2. Tap **Add to Home Screen**
3. Confirm **Add**

1. Open Zenith in **Safari**
2. Tap **Share**
3. Tap **Add to Home Screen**
4. Confirm **Add**

That icon opens like a normal iOS app: no Safari address bar, no nested fake iPhone. This is a web app on the Home Screen (PWA), not the App Store. A native Capacitor wrap can come later.

**The Home Screen icon only updates after this code is on production.** Until the customize PR is merged, Add to Home Screen still shows the older You tab (no Edit). After merge, delete the icon and Add to Home Screen again, or force-close the PWA.

On iPhone 14 Pro Max the status bar / Dynamic Island is padded with `env(safe-area-inset-*)` plus a 59px fallback when Safari reports 0. **You** has a sticky **Edit** button in the top-right. **Manage accounts** and **Manage categories** open full editors: add, rename, delete, reorder, per-account monthly budgets, nested subcategories, and **any emoji** (type or paste, or use the iPhone emoji keyboard).

## Local data

Home, Activity, Plan, and You read the on-device ledger. On **You** you can add or edit accounts (including a monthly budget for Bank), and add your own categories. Adding an expense uses those same lists. Notion is not part of this install.

Open locally:

```bash
python3 -m http.server 5173 --bind 0.0.0.0
# http://127.0.0.1:5173/
```

Or with the optional API (voice / OCR keys only — still no Notion needed):

```bash
node scripts/dev-server.js
```

## Vercel

Static files plus optional `/api/*` functions. `vercel.json` is in the repo so HTTPS deploys work. You do **not** need `NOTION_TOKEN` for the Home Screen app.

## Navigation

- **Home** — spent this month, health score, wallets, budgets, goals peek
- **Activity** — local ledger with search and date range
- **Plan** — budgets, recurring bills, savings goals, insights, travel (one free demo trip; full travel is Zenith Pro). Travel includes a custom FX rate, packing kit, tips, and optional posting into a home wallet.
- **+** — Voice, Scan, or Manual (voice/OCR only if those keys are set; you can always type)
- **You** — **Edit** (top-right), accounts, categories, dark mode, PIN lock, JSON backup, Zenith Pro

## Tests

```bash
npm test
```

## Later: Notion (optional)

Not needed to use Zenith. Left off unless `?notion=1` or `localStorage.zenith_notion = '1'`. Expense Tracker still owns any Notion writes.

### Notion Expenses (read path)

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

When `NOTION_TOKEN` is missing, the old Notion panels (if enabled) use **labeled example data**.

### Notion Accounts (read path)

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

**Per-account balance** (Cash / IDFC) = Opening − priced Expenses tagged with that Account. Null Amounts are excluded.

`GET /api/accounts` returns `{ source, accounts, balances }`.

### Notion Budgets (read path)

Database: [Budgets](https://app.notion.com/p/301bb78c3c094fb1aee38bcb57f7beb0) (`collection://3f8d31df-d13d-49a2-a9ac-f5b8489f737f`).

| Property | Type |
| --- | --- |
| Name | title |
| Category | select — same enums as Expenses |
| Monthly cap | number (rupee) |
| Notes | text |

**Left this month** = Monthly cap − this-month spend in that Category. Caps with no value show spend only (no progress bar).

`GET /api/budgets` returns `{ source, budgets, progress, monthKey }`.

### Environment variables (optional)

Copy `.env.example` only if you want live Notion, Sarvam voice, or Vision OCR.

| Variable | Required | Description |
| --- | --- | --- |
| `NOTION_TOKEN` | no | Notion integration secret. Also accepted: `NOTION_API_KEY`. |
| `NOTION_EXPENSES_DATA_SOURCE_ID` | no | Data source id `b35c3e74-0bc7-432d-8309-80a7583d3601` |
| `NOTION_EXPENSES_DATABASE_ID` | no | Database id `76941781c8ef4d258923b9c2a6750292` |
| `NOTION_ACCOUNTS_DATA_SOURCE_ID` | no | Defaults to `2c0de472-1d21-4243-bcd8-1fb19ab89bba` |
| `NOTION_ACCOUNTS_DATABASE_ID` | no | Defaults to `a9effaa05c66492a9780b5a36cda1d63` |
| `NOTION_BUDGETS_DATA_SOURCE_ID` | no | Defaults to `3f8d31df-d13d-49a2-a9ac-f5b8489f737f` |
| `NOTION_BUDGETS_DATABASE_ID` | no | Defaults to `301bb78c3c094fb1aee38bcb57f7beb0` |
| `NOTION_EXPENSES_USE_MOCK` / `NOTION_USE_MOCK` | no | Set to `1` to force example data even when a token is present |
| `SARVAM_API_KEY` | no | Sarvam Saaras STT. If unset, log expenses manually. |
| `GOOGLE_CLOUD_VISION_API_KEY` | no | Cloud Vision OCR. If unset, you can still attach a photo locally. |

Tokens stay on the server. The Home Screen app does not need them.
