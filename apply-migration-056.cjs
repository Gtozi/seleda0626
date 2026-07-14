const fs = require('fs');
require('dotenv').config();

const sql = fs.readFileSync('supabase/migrations/056_fix_split_payment_validation.sql', 'utf8');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

fetch(`${url}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`
  },
  body: JSON.stringify({ query: sql })
})
  .then(r => r.text())
  .then(text => {
    console.log(text);
    if (text.includes('error') || text.includes('Error')) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
