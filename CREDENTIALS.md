# Credentials checklist — paste each value into backend/.env

Copy `backend/.env.example` to `backend/.env`, then fill in:

## Required for the agent to think

- [ ] `HINDSIGHT_API_KEY` — sign in at https://ui.hindsight.vectorize.io,
      create an API key, and (in billing) apply the code `MEMHACK99` for $50.
- [ ] `GROQ_API_KEY` — https://console.groq.com/keys

## Required for real publishing + competitor discovery

- [ ] `META_ACCESS_TOKEN` — long-lived Page token from Graph API Explorer
- [ ] `FB_PAGE_ID` — numeric ID of the Facebook Page you'll post to
- [ ] `IG_BUSINESS_ACCOUNT_ID` — the IG Business account attached to that Page.
      To find it, in Graph API Explorer:
      `GET /{page-id}?fields=instagram_business_account,name`

## Scopes the token must have

- `pages_read_engagement`
- `pages_manage_posts`
- `pages_show_list`
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_insights`
- `business_management`

## Optional

- `COMPETITOR_IG_USERNAMES` — comma-separated public IG Business/Creator
  handles you want the agent to watch.
- `COMPETITOR_FB_PAGE_IDS` — comma-separated numeric page IDs.

## Once filled in

1. Start backend: `cd backend && python run.py`
2. Start frontend: `cd frontend && npm install && npm run dev`
3. Open http://localhost:5173 → Setup → hit "Seed NorthPulse"
4. Head to Chat and try:
   *"What do you know about our brand? Then plan me 7 days of content."*

You should see the agent call `reflect_on_memory` and `plan_calendar`
tools in the chat, and every draft in the Calendar page will have a
"Why now" rationale that cites a specific memory.
