# Test Credentials (No-DB Development Mode)

These accounts work when the app is running **without** a Supabase database connection (development-fallback mode).

| # | Department      | Email                     | Password  | Role               |
|---|-----------------|---------------------------|-----------|--------------------|
| 1 | Front Office    | frontoffice@erp.com       | admin123  | front office manager|
| 2 | Housekeeping    | housekeeping@erp.com      | admin123  | housekeeping       |
| 3 | F&B             | fb@erp.com                | admin123  | fb_manager         |
| 4 | Maintenance     | maintenance@erp.com       | admin123  | maintenance        |
| 5 | General Manager | gm@erp.com                | admin123  | executive          |
| 6 | Finance         | finance@erp.com           | admin123  | fin_manager        |
| 7 | HR              | hr@erp.com                | admin123  | hr                 |
| 8 | Inventory       | inventory@erp.com         | admin123  | inventory          |
| 9 | Procurement     | procurement@erp.com       | admin123  | procurement        |
| 10| System Admin    | admin@erp.com             | admin123  | admin              |
| 11| Operations      | operations@erp.com        | admin123  | ops_manager        |
| 12| Sales           | sales@erp.com             | admin123  | sales              |
| 13| Concierge       | concierge@erp.com         | admin123  | concierge          |
| 14| Spa & Wellness  | spa@erp.com               | admin123  | spa                |
| 15| Banquet & Events| banquet@erp.com           | admin123  | banquet            |
| 16| Transportation  | transportation@erp.com    | admin123  | transportation      |
| 17| Revenue         | revenue@erp.com           | admin123  | revenue            |
| 18| Security        | security@erp.com          | admin123  | security_manager    |

## How to use

If your `.env` file already contains Supabase credentials but you want to test **without** connecting to the database, set the `FORCE_FALLBACK_AUTH` environment variable:

```bash
# Windows PowerShell
$env:FORCE_FALLBACK_AUTH="true"
npm run dev

# Windows CMD
set FORCE_FALLBACK_AUTH=true
npm run dev
```

Alternatively, if `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are **not** set in your environment, fallback mode activates automatically.

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000/api/health` — it should report `"authStore": "development-fallback"`.
3. Log in with any email/password pair from the table above.

> Note: You can change the fallback password by setting the `DEV_LOGIN_PASSWORD` environment variable.
