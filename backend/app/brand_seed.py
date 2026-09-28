"""NorthPulse — fictional D2C athletic apparel brand seeded for the demo.

Everything here is safe fiction. When the user connects their real
FB Page / IG Business account, the brand config will be *overwritten* by
whatever they tell the agent during onboarding — but this seed lets the
demo work end-to-end even before any real data flows in.
"""
from __future__ import annotations

BRAND = {
    "name": "NorthPulse",
    "tagline": "Built for the second mile.",
    "voice": (
        "Direct, warm, and a little sweaty. We talk to runners and lifters "
        "like teammates in the group chat — never like a brochure. Second "
        "person, active verbs, one idea per sentence."
    ),
    "audience": (
        "18-30 hybrid athletes in tier-1/2 Indian cities. Trains 4-6 days a "
        "week, cares more about how gear performs at km 8 than at km 0. Follows "
        "small run clubs, saves reels, screenshots pace splits."
    ),
    "pillars_json": [
        {
            "name": "Second-mile stories",
            "detail": "UGC + community: runners talking about the moment they wanted to quit and didn't.",
        },
        {
            "name": "Product-in-use",
            "detail": "Real people in the gear at real distances — no static flatlays.",
        },
        {
            "name": "Coach's corner",
            "detail": "20-second technique / recovery tips from vetted coaches.",
        },
        {
            "name": "Drop hype",
            "detail": "Time-boxed teasers 48h → 24h → 1h → live for new colorways.",
        },
        {
            "name": "Behind the seams",
            "detail": "How-it's-made cuts: fabric sourcing, testing, factory floor.",
        },
    ],
    "website": "https://northpulse.example",
    "ig_username": "northpulse.run",
    "cta_default_link": "https://northpulse.example/shop",
}

# Fictional past-post history so the "memory over time" demo has content
# from day 1. These get retained to Hindsight on first boot.
SEED_HISTORY = [
    {
        "content": "Reel 'kilometre 8 hurts, we made this for what comes after' scored 21K reach, 340 saves, 6.1% engagement. Second-mile Stories pillar. Aug 12.",
        "context": "past-post",
        "tags": ["past-post", "high-performer", "pillar:second-mile-stories"],
    },
    {
        "content": "Carousel 'anatomy of a 22° morning' (5-slide fabric breakdown) scored 4.2K reach, 71 saves, 1.9% engagement. Behind the Seams pillar. Aug 19.",
        "context": "past-post",
        "tags": ["past-post", "underperformer", "pillar:behind-the-seams"],
    },
    {
        "content": "Story series with coach Priya on cadence at threshold — 41% completion, 18 replies. Coach's Corner pillar. Aug 21.",
        "context": "past-post",
        "tags": ["past-post", "high-performer", "pillar:coachs-corner"],
    },
    {
        "content": "Static flatlay of Trail Hoodie in graphite — 1.1K reach, 12 saves. Confirmed: flatlays underperform product-in-use by ~4x on saves.",
        "context": "past-post",
        "tags": ["past-post", "underperformer", "learning"],
    },
    {
        "content": "Drop teaser for Cinder colorway posted Sunday 8pm IST hit 6.4% engagement vs weekday-morning average of 2.1%. Consider defaulting drops to Sunday evening.",
        "context": "learning",
        "tags": ["learning", "posting-time", "pillar:drop-hype"],
    },
    {
        "content": "Comment sentiment on second-mile UGC skews to 'this made me lace up' / 'sending to my run partner' — save-worthy emotional trigger, not price.",
        "context": "learning",
        "tags": ["learning", "audience-sentiment"],
    },
]

# Fictional competitors — set will be overridden by the user's real
# COMPETITOR_IG_USERNAMES in .env once they provide them.
DEMO_COMPETITORS = [
    {"handle": "onrunning", "channel": "instagram", "display_name": "On (running)"},
    {"handle": "tracksmith", "channel": "instagram", "display_name": "Tracksmith"},
    {"handle": "gymshark", "channel": "instagram", "display_name": "Gymshark"},
]
