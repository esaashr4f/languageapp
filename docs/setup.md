# Deploying Zaban (Vercel + Supabase)

## 1. Vercel (hosting)

1. Import this GitHub repo at vercel.com → Add New → Project.
2. Vercel reads `vercel.json`: framework Vite, build `npm run build`, output `dist`.
3. Deploy. The game works straight away in guest mode (progress saved on the device).

## 2. Supabase (log-in and cloud saves)

1. Create a project at supabase.com.
2. SQL editor → run `supabase/schema.sql` (creates the `saves` table, one row per player,
   locked down so players can only read and write their own save).
3. Settings → API: copy the Project URL and the `anon` public key.
4. In Vercel → Project → Settings → Environment Variables add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`, then redeploy. (Locally: copy `.env.example` to `.env.local`.)
5. Supabase → Authentication → URL Configuration: set Site URL to your Vercel URL and add
   it (plus `http://localhost:5173`) to Redirect URLs.

## 3. Sign-in providers

Supabase → Authentication → Providers. Each needs an app on the provider's developer
site; Supabase shows the callback URL to paste there.

| Provider | Where | Notes |
| --- | --- | --- |
| Google | console.cloud.google.com → APIs & Services → Credentials → OAuth client | Free |
| Apple | developer.apple.com → Certificates, Identifiers & Profiles → Services ID | Needs a paid Apple Developer account |
| Facebook | developers.facebook.com → Create App → Facebook Login | Needs app review to go public |
| Discord | discord.com/developers → New Application → OAuth2 | Free |

Buttons stay greyed out until Supabase is configured. Enable all four, or remove the ones
you don't want from `src/ui/accountView.ts`.

## 4. Claude (conversations and smarter grading)

1. console.anthropic.com → API keys → create a key. Set a monthly spend limit.
2. In Vercel → Environment Variables add:
   - `ANTHROPIC_API_KEY` (server only, never prefixed with `VITE_`)
   - `SUPABASE_URL` (same as `VITE_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Settings → API; server only, it bypasses
     row-level security so the server can record usage)
3. Re-run `supabase/schema.sql` (it adds the `entitlements` table) and redeploy.

Locally, put the same variables in `.env.local` and run `npm run dev`: the dev server runs
the `/api` functions too. Without a key, conversations use canned demo replies.

See `docs/ai-integration.md` for how it works and the plan limits.
