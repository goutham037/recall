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


def generate_domain_seed_history(brand: dict) -> list[dict]:
    name = (brand.get("name") or "Our Brand").strip()
    if name.lower() == "northpulse":
        return SEED_HISTORY

    tagline = brand.get("tagline") or ""
    audience = brand.get("audience") or "our target audience"
    pillars = brand.get("pillars_json") or []
    if isinstance(pillars, str):
        import json
        try:
            pillars = json.loads(pillars)
        except Exception:
            pillars = []

    p1 = pillars[0].get("name") if len(pillars) > 0 and isinstance(pillars[0], dict) else "Product in use"
    p2 = pillars[1].get("name") if len(pillars) > 1 and isinstance(pillars[1], dict) else "Customer stories"
    p3 = pillars[2].get("name") if len(pillars) > 2 and isinstance(pillars[2], dict) else "Drop hype"
    p4 = pillars[3].get("name") if len(pillars) > 3 and isinstance(pillars[3], dict) else "Behind the scenes"

    combined = (name + " " + tagline + " " + str(pillars)).lower()
    is_grocery = any(k in combined for k in ["grocery", "groceries", "mart", "minute", "doorstep", "food", "delivery", "quick"])

    if is_grocery:
        return [
            {
                "content": f"Reel: 'When you need dinner ingredients at 9:30 PM delivered in 15 mins' scored 34K reach, 480 saves, 7.2% engagement. Tagged: {p1}. Real-world kitchen emergency solve + doorstep arrival clip. Confirmed: our story-driven reels solving urgent everyday problems are the clear winner for saves.",
                "context": "past-post",
                "tags": ["past-post", "high-performer", f"pillar:{p1.lower().replace(' ', '-')}"],
            },
            {
                "content": f"Carousel: 'Top 5 midnight cravings delivered to urban apartments in under 15 minutes' scored 22K reach, 390 saves, 5.8% engagement. Confirmed: late-night snack carousels have 3.4x higher bookmark rate than daytime announcements.",
                "context": "past-post",
                "tags": ["past-post", "high-performer", f"pillar:{p2.lower().replace(' ', '-')}"],
            },
            {
                "content": f"Behind-the-scenes video: 'From order tap to rider rolling out in 3 minutes flat' scored 18K reach, 270 saves. High retention among {audience} who value instant fulfillment and speed.",
                "context": "past-post",
                "tags": ["past-post", "learning", "high-performer", f"pillar:{p4.lower().replace(' ', '-')}"],
            },
            {
                "content": f"Static flyer: Grocery price catalogue list with discounts scored 1.2K reach, 42 saves. Confirmed: static catalogue graphics underperform relatable video reels by 4x on saves and reach.",
                "context": "past-post",
                "tags": ["past-post", "underperformer", "learning"],
            },
            {
                "content": f"Audience insight: {audience} respond strongest to urgent 'dinner rescue', 'apartment essentials', and 'midnight cravings' hooks between 7:30 PM and 11:00 PM.",
                "context": "brand-audience",
                "tags": ["brand-audience", "learning"],
            },
            {
                "content": f"Voice guide in action: Writing copy like a WhatsApp group chat ('besties don't let besties run out of milk at midnight') drove 2.5x more comment replies than formal supermarket corporate ads.",
                "context": "brand-voice",
                "tags": ["brand-voice", "learning"],
            },
        ]
    else:
        return [
            {
                "content": f"Reel: Real-world problem solved by {name} ({tagline}) scored 26K reach, 420 saves, 6.8% engagement. Tagged: {p1}. Problem-to-solution video format gets 3.5x more saves than static product photos.",
                "context": "past-post",
                "tags": ["past-post", "high-performer", f"pillar:{p1.lower().replace(' ', '-')}"],
            },
            {
                "content": f"Carousel breakdown: '5 insider things our community loved' scored 19K reach, 340 saves. High bookmark rate among {audience}.",
                "context": "past-post",
                "tags": ["past-post", "high-performer", f"pillar:{p2.lower().replace(' ', '-')}"],
            },
            {
                "content": f"Behind the scenes clip: Design and craft process scored 14K reach, 230 saves. High authenticity signal for {audience}.",
                "context": "past-post",
                "tags": ["past-post", "high-performer", f"pillar:{p4.lower().replace(' ', '-')}"],
            },
            {
                "content": f"Static flyer advertisement scored 1.1K reach, 38 saves. Confirmed: static graphics underperform dynamic reels by ~4x on saves.",
                "context": "past-post",
                "tags": ["past-post", "underperformer", "learning"],
            },
            {
                "content": f"Drop teaser posted Sunday 8pm IST hit 6.2% engagement vs weekday average of 2.0%. Sunday evening is peak engagement window for {audience}.",
                "context": "learning",
                "tags": ["learning", "posting-time", f"pillar:{p3.lower().replace(' ', '-')}"],
            },
            {
                "content": f"Voice insight: Conversational, community-first copy yields 2x higher share rate than promotional product cataloguing.",
                "context": "brand-voice",
                "tags": ["brand-voice", "learning"],
            },
        ]


def generate_domain_calendar_drafts(brand: dict) -> list[dict]:
    from datetime import date, timedelta
    name = (brand.get("name") or "Our Brand").strip()
    tagline = brand.get("tagline") or ""
    website = brand.get("website") or "https://example.com"
    combined = (name + " " + tagline).lower()
    is_grocery = any(k in combined for k in ["grocery", "groceries", "mart", "minute", "doorstep", "food", "delivery", "quick"])

    today = date.today().isoformat()
    d1 = (date.today() + timedelta(days=1)).isoformat()
    d2 = (date.today() + timedelta(days=2)).isoformat()
    d3 = (date.today() + timedelta(days=3)).isoformat()

    if is_grocery:
        return [
            {
                "scheduled_for": today,
                "channels": "instagram,facebook",
                "pillar": "Product in use",
                "hook": "Dinner at 8, missing garlic? Solved in 15 mins.",
                "caption": "No frantic store runs, no paused recipes. Tap, order, cook. Your kitchen essentials at your doorstep in under 15 minutes.",
                "hashtags": "#grocerydelivery #15mindelivery #apartmentliving #quickcommerce",
                "image_prompt": "Fast-moving delivery rider delivering fresh groceries at an apartment doorway at dusk, warm lighting.",
                "cta_link": website,
                "status": "draft",
                "rationale": "High-urgency dinner rescue reel based on peak evening apartment saves.",
                "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
            },
            {
                "scheduled_for": d1,
                "channels": "instagram,facebook",
                "pillar": "Customer stories",
                "hook": "Episode 4 was starting. Ice cream arrived before the opening credits.",
                "caption": "Urban apartment life hack: midnight cravings delivered in 15 minutes flat. What’s your emergency snack order?",
                "hashtags": "#midnightsnacks #apartmenthacks #quickdelivery #sunshainymart",
                "image_prompt": "Living room couch scene with favorite late-night ice cream and snacks unboxed, cozy ambient lighting.",
                "cta_link": website,
                "status": "draft",
                "rationale": "Grounded in learning: late-night snack carousels generate 3.4x higher bookmark rate.",
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
            },
            {
                "scheduled_for": d2,
                "channels": "instagram,facebook",
                "pillar": "Behind the scenes",
                "hook": "Tap order. 180 seconds later, your rider is already rolling.",
                "caption": "Behind the counter at Sunshainy Mart: hyper-fast packing, fresh checks, zero delays. 15 minutes isn’t a promise, it’s our rhythm.",
                "hashtags": "#behindthescenes #speeddelivery #freshgroceries #hustle",
                "image_prompt": "Dark store aisle with an associate handpicking fresh avocados and bread into an insulated tote bag.",
                "cta_link": website,
                "status": "draft",
                "rationale": "Builds trust in fresh-checking and 15-minute turnaround.",
                "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
            },
            {
                "scheduled_for": d3,
                "channels": "instagram,facebook",
                "pillar": "Drop hype",
                "hook": "Fresh weekend batch alert: organic mangoes & artisanal sourdough.",
                "caption": "Dropping this morning on Sunshainy Mart. Limited batch, grab yours before the breakfast rush ends.",
                "hashtags": "#weekenddrop #freshproduce #organicgroceries #quickeats",
                "image_prompt": "Vibrant basket of fresh organic fruits and baked bread on a sunlit wooden counter.",
                "cta_link": website,
                "status": "draft",
                "rationale": "Sunday morning impulse grocery order driver.",
                "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            },
        ]
    else:
        return [
            {
                "scheduled_for": today,
                "channels": "instagram,facebook",
                "pillar": "Product in use",
                "hook": f"Real performance when it matters most — {name}.",
                "caption": f"Built for everyday champions who don't compromise. Experience {name} in action.",
                "hashtags": f"#{name.lower().replace(' ', '')} #essentials #lifestyle",
                "image_prompt": f"Product in use in a vibrant urban environment, hero shot.",
                "cta_link": website,
                "status": "draft",
                "rationale": "Core product-in-use awareness post.",
                "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            },
            {
                "scheduled_for": d1,
                "channels": "instagram,facebook",
                "pillar": "Behind the scenes",
                "hook": "Crafted with intention. Here is how we build it.",
                "caption": "Every detail matters. A quick look behind our workshop process.",
                "hashtags": "#behindthescenes #craftsmanship #quality",
                "image_prompt": "Detailed artisan workshop with materials and tools.",
                "cta_link": website,
                "status": "draft",
                "rationale": "Transparency and craftsmanship focus.",
                "image_url": "https://images.unsplash.com/photo-1507034589631-9433cc6bc453?auto=format&fit=crop&w=800&q=80",
            },
        ]

