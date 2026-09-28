# Handoff — Recall

> A note from one hacker to another. Everything you need to pick this up.

## What this is (10-sec pitch)

**Recall = a memory-first CMO for the modern brand.**
An AI marketing agent that remembers every post, every learning, and every competitor move — and gets sharper each conversation. Built on **Hindsight** (memory) + **Groq** (LLM) + **Meta Graph API** (publishing).

Submitted to **MemHack '26**.

## Where it lives

- **Repo:** https://github.com/goutham037/recall (public, MIT)
- **Local:** `C:\Users\ASUS\OneDrive\Desktop\recall\`
- **Branch:** `main` (no feature branches yet)

## Boot it (5 min)

**Both servers run locally, side-by-side.**

```bash
# 1. Backend  →  http://localhost:8000
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1        # Windows PowerShell
pip install -r requirements.txt
cp .env.example .env                # then fill in keys (see below)
python run.py
```

```bash
# 2. Frontend  →  http://localhost:5173
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. You'll see the landing page. Click **"Start the demo →"**, sign up with **any email** (auth is dummy — literally anything works), then hit **Seed NorthPulse** on the Setup page.

That's it — you're in.

## Keys you need to plug in

All go into `backend/.env`. Even without keys, the UI loads and the landing/signup/nav all work. But the agent won't *think* without Hindsight + Groq.

| Key | Grab it from | Free? |
|---|---|---|
| `HINDSIGHT_API_KEY` | [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io) — promo code `MEMHACK99` gives $50 credit | Yes for hackathon |
| `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) | Yes, generous tier |
| `META_ACCESS_TOKEN` | Meta Graph API Explorer — long-lived Page token | Yes (dev app) |
| `FB_PAGE_ID` | Your test Facebook Page (numeric ID) | — |
| `IG_BUSINESS_ACCOUNT_ID` | `GET /{page-id}?fields=instagram_business_account` in Graph Explorer | — |

**Scopes the Meta token needs:** `pages_read_engagement`, `pages_manage_posts`, `pages_show_list`, `instagram_basic`, `instagram_content_publish`, `instagram_manage_insights`, `business_management`.

**Minimum to demo:** Hindsight + Groq keys. Without Meta, publishing/competitor tracking are stubbed but everything else works.

## The 60-second demo (this is what you show judges)

1. **Setup → Seed NorthPulse.** Six past-post learnings + brand DNA get loaded into Hindsight.
2. **Chat → *"What do you know about our brand?"*** Agent calls `reflect_on_memory`, quotes actual past posts.
3. **Chat → *"Plan me 7 days, Trail Hoodie drop, IG + FB."*** Agent recalls learnings, drafts a memory-grounded calendar. Every draft has a *"Why now"* citing a specific memory.
4. **Calendar → click a draft → Publish.** Ships real post to IG + FB (if Meta creds set).
5. **Calendar → Refresh performance.** Insights fetched from Meta, stored as new `performance` memories.
6. **Competitors → track `onrunning`.** Their recent posts filed under `competitor:onrunning`.
7. **Chat → *"How is @onrunning different from us?"*** Agent cites the fetched posts.
8. **Memory → Reflect → *"what makes our posts work?"*** Hindsight's `reflect()` synthesizes a narrative answer with citations. **← this is the killer moment.**

## What's on each page

| Route | What it does |
|---|---|
| `/` | Editorial landing page (public) |
| `/signin`, `/signup` | Dummy auth. Any email + 4-char password. |
| `/app/chat` | The main conversation. Every agent reply shows which memory tools it used. |
| `/app/studio` | **New.** Post generator + Recommendations + Analytics + Trending — all one page. |
| `/app/calendar` | Weekly editorial grid + draft cards with *"Why now"* citations |
| `/app/competitors` | Track rivals, drill into their remembered posts |
| `/app/memory` | Hindsight bank stats + recall/reflect playground + manual retain |
| `/app/setup` | Integration status + brand seed + demo script |

## Backend endpoints (34 total)

Interactive docs at **http://localhost:8000/docs** when the backend is running.

Groups:
- `/agent/*` — chat + history (multi-turn tool loop)
- `/content/*` — plan, calendar CRUD, publish, performance refresh
- `/competitors/*` — track, list, drill into posts
- `/memory/*` — stats, list, recall, reflect, retain, graph, delete
- `/studio/*` — generate, analytics, recommendations, trending
- `/brand`, `/brand/seed` — brand config + one-click seed
- `/health`, `/status` — reachability check for the three integrations

## Design system (so it looks consistent)

- Fonts: **Instrument Serif** (display) × **Instrument Sans** (UI) × **JetBrains Mono** (data). All Google Fonts, loaded in `index.html`.
- Palette: warm cream `#F5F2EA` canvas, ink `#14140F`, **Sociovia green `#34B233`** as the *only* accent. No gradients.
- Editorial cues: masthead with Vol · Issue · dateline, section eyebrows with rules, pull-quotes, drop-cap intros, editorial numbered lists.
- All tokens live in `frontend/tailwind.config.js` and `frontend/src/index.css`.
- Aesthetic: newspaper × modern tech dashboard. Think Bloomberg × Linear.

## Rough edges (heads-up)

- **Hindsight bank must exist before recall/reflect works.** Seeding NorthPulse creates it. First call to `/memory/stats` returns 404 if you haven't seeded yet — that's why the setup card shows "Not configured" until you seed.
- **Meta IG publishing needs an IMAGE_URL** — no image = IG post fails. FB can post text-only. You can drop any public https://... image url into the calendar item.
- **Instagram Business Discovery** for competitor tracking only works on public IG **Business/Creator** accounts, not personal profiles. Failures are surfaced with reason in the UI.
- **Vite proxy 502s** on first load — harmless, they're just retries while the backend is starting.
- **Uvicorn `--reload` doesn't always pick up NEW files** on Windows — if you add a new route file, restart the backend manually.

## Submission checklist (MemHack)

- [x] Working GitHub repo (public): https://github.com/goutham037/recall
- [x] Clean README with pitch, quickstart, memory-usage table
- [x] Hindsight memory central to value prop
- [x] Working E2E demo (chat → plan → publish → learn → reflect)
- [ ] Demo video (recording — needs to be filmed with keys plugged in)
- [ ] Article (MemHack content guide)
- [ ] Social post (MemHack content guide)
- [ ] Personal video (MemHack content guide)

## Where to add next

If you get 30 more min:
1. Wire the Studio `Generate + save as drafts` button so variants land on the Calendar page immediately.
2. Add a "Trending" chip row into the Chat starters (uses `/studio/trending`).
3. Auto-schedule Publish via a cron-style scheduled task.

If you get 2 hours:
1. Multi-brand workspaces (already namespaced by Hindsight `bank_id` — just needs a workspace picker in the UI).
2. Voice input on Chat (Web Speech API — 30 lines).
3. Streaming responses from Groq for the chat (currently blocking).

## Contact

- Repo owner: **goutham037** (GitHub)
- Original build: **saurabh** — reach out if anything's on fire

Good luck. Ship it. 🟢
