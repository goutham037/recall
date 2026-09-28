# Recall — The Marketing Desk

> **A memory-first CMO for the modern brand.**
> Chat with a chief marketer that remembers every post, every learning, every rival move — and gets sharper with each conversation.

Built for **MemHack '26** with **[Hindsight](https://hindsight.vectorize.io)** (persistent memory), **[Groq](https://groq.com)** (LLM), and the **Meta Graph API** (publishing).

---

## Why

Stateless chatbots forget. Marketing teams don't have that luxury — they live and die by institutional memory. What worked last quarter, which reel got saves, which pillar the audience actually responded to, which competitor just shifted messaging.

Recall keeps that file open. Every conversation, every published post, every performance metric and every competitor move is retained in Hindsight and cited by the next answer. Ask the desk *why* it recommends something — it reads from the file.

## What it does

- **Persistent brand memory** — voice, audience, pillars, past posts, learnings, competitor moves. All retained in Hindsight, tagged, retrievable.
- **Post generator** — briefs → three memory-grounded variants, each with copy, hashtags, art direction, CTA link, and a cited memory.
- **Weekly editorial calendar** — 7-day grid, drag-scheduled drafts, every card carries a *"Why now"* citing the memory it leaned on.
- **Analytics with a narrative** — metrics that come with an editorial answer. What's working, and why, grounded in Hindsight's `reflect()`.
- **Recommendation punch list** — five concrete actions this week, ranked by leverage, each cited.
- **Competitor watch** — track rivals; every post filed under `competitor:<handle>` and citable later.
- **Trending desk** — leaderboards by engagement, hashtag frequency, thematic clusters.
- **One-click publishing** — Facebook Page + Instagram Business via the Meta Graph API; insights feed back as new memories.
- **Multi-turn agent loop** — Groq function-calling with 10 tools (plan, publish, learn, watch, recall, reflect).
- **Memory inspector** — see what the desk knows; `recall()` for raw results or `reflect()` for a synthesized editorial.

## How it works — in five acts

1. **Onboard the brand.** Voice, audience, pillars — filed as durable memories.
2. **Ask for a plan.** Every draft carries a *"Why now"* citing the memory it leaned on.
3. **Publish.** One click ships to FB + IG. The post itself becomes a memory.
4. **Fetch performance.** Insights come back as retained learnings.
5. **Ask again.** The next answer is grounded in the last cycle's results. Smarter every turn.

## Architecture

```
┌──────────────┐        ┌─────────────────┐        ┌──────────────┐
│   Frontend   │  ─→    │     Backend     │  ─→    │  Hindsight   │  memory
│  Vite + React│        │  FastAPI · SQLite│        │──────────────│
│   Tailwind   │  ←─    │  Python 3.11+   │  ←─    │     Groq     │  LLM
└──────────────┘        └─────────────────┘        │──────────────│
                                                    │  Meta Graph  │  publishing
                                                    └──────────────┘
```

- **Hindsight** — the brain. Every fact, past post, and learning is retained here.
- **SQLite** — the filing cabinet. Fast lookups for post IDs, schedules, competitor lists.
- **Groq** — the voice. Chooses tools, drafts plans, writes captions.
- **Meta Graph** — the hands. Publishes to FB + IG, reads insights back.

## Quick start

**Backend** (Python 3.11+)

```bash
cd backend
python -m venv .venv
./.venv/Scripts/activate    # on Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env        # fill in the keys — see below
python run.py               # http://localhost:8000
```

**Frontend** (Node 20+)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173), sign up with any email (dummy auth), and click **Seed NorthPulse** on the Setup page. That loads the demo brand DNA + six past-post learnings into Hindsight — enough to make the "learning over time" demo work from turn one.

## Environment

All values live in `backend/.env`. See `backend/.env.example` for the full list.

**Required for the agent to think**

| Variable | Where | Notes |
|---|---|---|
| `HINDSIGHT_API_KEY` | [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io) | Promo `MEMHACK99` gives $50 credit |
| `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) | Default model `openai/gpt-oss-120b` |

**Required for real publishing + competitor discovery**

| Variable | Where | Notes |
|---|---|---|
| `META_ACCESS_TOKEN` | Meta Graph API Explorer | Long-lived Page token |
| `FB_PAGE_ID` | Your test Facebook Page | Numeric ID |
| `IG_BUSINESS_ACCOUNT_ID` | `GET /{page-id}?fields=instagram_business_account` | IG Business account linked to the Page |

Required token scopes: `pages_read_engagement`, `pages_manage_posts`, `pages_show_list`, `instagram_basic`, `instagram_content_publish`, `instagram_manage_insights`, `business_management`.

## Demo script (60 seconds)

1. **Seed** — Setup → *Seed NorthPulse*
2. **Chat** — *"What do you know about our brand?"* → agent calls `reflect_on_memory`, cites past-post outcomes
3. **Plan** — *"Plan me 7 days, Trail Hoodie drop, IG + FB."* → agent recalls learnings, drafts a memory-grounded calendar
4. **Publish** — Calendar → review the *"Why now"* rationale → **Publish** → real IG + FB post
5. **Learn** — Refresh performance → Insights fetched, new `performance` memories retained
6. **Compete** — Competitors → track a real IG business handle → watch memories appear
7. **Reflect** — Memory → *"what makes our posts work?"* → Hindsight's `reflect()` synthesizes a narrative answer with citations

## Project layout

```
recall/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entrypoint
│   │   ├── config.py               # env-backed settings
│   │   ├── db.py                   # SQLite schema
│   │   ├── hindsight_client.py     # REST wrapper — bank / retain / recall / reflect
│   │   ├── groq_client.py          # OpenAI-compatible chat completions
│   │   ├── meta_client.py          # FB + IG publishing, competitor discovery
│   │   ├── brand_seed.py           # NorthPulse DNA + past-post learnings
│   │   ├── agent/
│   │   │   ├── system_prompt.py
│   │   │   ├── tools.py            # 10 tools the LLM can call
│   │   │   └── loop.py             # agentic tool-calling loop
│   │   └── routes/
│   │       ├── agent.py            # /agent/chat, /agent/history
│   │       ├── content.py          # /content/plan, /content/calendar, publish
│   │       ├── competitors.py      # /competitors/track, /competitors/*/posts
│   │       ├── memory.py           # /memory/{stats,list,recall,reflect,retain,graph}
│   │       ├── studio.py           # /studio/{generate,analytics,recommendations,trending}
│   │       ├── brand.py            # /brand, /brand/seed
│   │       └── system.py           # /health, /status
│   ├── run.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── lib/
    │   │   ├── auth.ts             # dummy session (localStorage)
    │   │   ├── api.ts              # typed HTTP client
    │   │   └── icons.tsx
    │   ├── components/Shell.tsx    # masthead + nav + user badge
    │   └── pages/
    │       ├── Landing.tsx         # public marketing page
    │       ├── Signin.tsx
    │       ├── Signup.tsx
    │       ├── Chat.tsx            # the conversation
    │       ├── Studio.tsx          # generator + recs + analytics + trending
    │       ├── Calendar.tsx        # weekly editorial grid
    │       ├── Competitors.tsx     # watch list
    │       ├── Memory.tsx          # bank stats + recall/reflect playground
    │       └── Setup.tsx           # integrations + brand seed
    └── package.json
```

## Design system

- Type: **Instrument Serif** (display) × **Instrument Sans** (UI) × **JetBrains Mono** (data)
- Palette: warm cream `#F5F2EA` canvas, ink `#14140F`, **Sociovia green `#34B233`** as the single accent
- Editorial cues: masthead with Vol · Issue · dateline, section eyebrows, pull-quotes, drop-cap intros, editorial numbered lists
- No gradients. No filler emoji. Subtle SVG paper grain overlay for warmth.

## How memory is used (for the judges)

| Where | How | Why |
|---|---|---|
| Every chat turn | `retain()` tagged `conversation` | The next chat is aware of the last one, even after a restart |
| Brand onboarding | `retain()` tagged `brand-voice`, `brand-audience`, `brand-pillar` | Durable world facts every future answer is grounded in |
| Past-post seed | `retain()` tagged `past-post`, `high-performer`, `underperformer`, `learning` | Gives the demo an immediate "learning curve" from turn 1 |
| Content planning | `recall()` with tag filter → grounding into the plan LLM | Every draft cites the memory it leaned on |
| "Why?" answers | `reflect()` | Hindsight LLM-synthesizes over facts; we render `based_on` beside the answer |
| Competitor research | `retain()` tagged `competitor:<handle>` per fetched post | Enables "how is @X different from us" answers weeks later |
| Performance loop | `retain()` tagged `performance` after Meta Insights pull | The next plan avoids formats that underperformed |

## Roadmap

- [ ] Auto-schedule Publish jobs to Meta Graph via a scheduled task
- [ ] Voice input on Chat (Web Speech API)
- [ ] Multi-brand workspaces (already namespaced by Hindsight `bank_id`)
- [ ] Ad-campaign copy generator (Google/Meta Ads)
- [ ] A/B result feedback loop into `learning` memories

## Credits

- **[MemHack '26](https://memhack.co)** for the challenge
- **[Vectorize](https://vectorize.io)** for [Hindsight](https://hindsight.vectorize.io) — the memory layer this is built on
- **[Groq](https://groq.com)** for fast LLM inference (`openai/gpt-oss-120b`, `qwen/qwen3-32b`)
- **Meta** for the Graph API

## License

MIT — see [LICENSE](LICENSE).
