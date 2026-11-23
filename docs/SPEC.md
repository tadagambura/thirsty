# Thirsty: Spec

**Keep your plants alive, and watch them grow** · #4 of 15 · Wave 1: Daily keepers · Used: Daily rewards, weekly care · Easy · Revenue potential: Medium · Family, Pets & Plants · Source: New (Claude)

## One-liner

Every plant gets its own profile: type, nickname, care schedule and a growth portfolio of photos that turns into a time-lapse over the months. Thirsty reminds you when each plant needs water or food, you log care in one tap, and you earn gems for every care action and for each plant's own milestones (first new leaf, repotted, survived winter, one year together). Spend gems on pot styles, themes and streak freezes.

## Problem / audience

- **Who it's for:** Houseplant owners, especially new ones who keep killing plants.
- **The problem it solves:** People forget to water, or over-water because they can't remember when they last did.
- **Example:** A user with eight plants gets a Sunday reminder for three, taps 'watered' and earns gems. Monty the monstera hits 'one year together' with nine new leaves, and the time-lapse gets shared to TikTok.

## MVP features (ship with only these)

1. Plant profiles: type, nickname, care presets
2. Watering and feeding reminders; one-tap 'watered' log
3. Growth portfolio: monthly photo prompt per plant, building a timeline and time-lapse
4. Per-plant milestones (first new leaf, repotted, 6 months, survived winter, 1 year)
5. Gems for care actions and milestones, spent on pot styles, themes and streak freezes

## Not in MVP

- Seasonal schedule adjustments
- Household sharing (both people water)
- Care guides from trusted sources
- Yearly 'your plants this year' recap

## Monetisation

| Model | Detail |
|---|---|
| Free | Up to 5 plants, with ads |
| Premium | £24.99/year (shown first) or £3.49/month: unlimited plants, full growth portfolio, cloud photo backup, sharing |
| Affiliate | Plant-care products, clearly labelled |

Prices are starting points; test before committing. **Portfolio premium promise:** free has ads; the moment you pay you get no ads, cloud backup and storage, and sync across your devices, plus this app's extras.

## Retention: The Progression Loop

| Stage | Design |
|---|---|
| Cue | Watering reminders and a daily gem check-in |
| Tiny win | Tap 'watered' or add a photo |
| Progress | Each plant's milestones, growth time-lapse, gems |
| Share | Growth time-lapses and milestone cards |
| Next step | Next milestone for each plant; suggest a new plant |
| Cadence | Daily rewards, weekly care |

Follow the portfolio guardrails: no guilt-trip notifications, no fake urgency, progress is
never wiped, at most one notification a day by default.

## Animation and tone: five signature animations

**Full drama.** Duolingo-style theatrics: characters, big over-the-top reactions, sound effects. Thirsty's plant death is the only animation that takes over the full screen ('NOOOOOOO!!!! NOT CYPHICUS!!!!').

- Plant health hits zero: the ONE full-screen moment: slow-motion wilt, tiny violin, 'NOOOOOOO!!!! NOT CYPHICUS!!!!', then revive with gems
- Over-watered: the plant pops up wearing a snorkel ('glug glug, I'm drowning')
- New leaf milestone: the plant does a victory dance as the leaf unfurls with a 'ta-da'
- Watered on time: the plant gulps it down and burps a tiny bubble
- One year together: birthday party, tiny cake, the plant in a party hat

**Line we don't cross:** Never claims the user's real plant has died: it's the plant's in-app health, and there's always a way to revive it.

## AI

**None.** Not needed. Plain code does everything this app does. (Portfolio rule: plain code first, code does the maths,
cheapest model, shared budget cap, premium-gated.)

## Platform & data

- **Platform:** Expo app.
- **Data:** On the device; photos compressed and stored on the phone, with cloud backup as a premium feature so storage is paid for by the people who use it.
- **Backend:** None for the free version: everything lives on the phone. Premium backup and sync use the shared portfolio backend (see the master repo's HOSTING.md).
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob, shared Progression Loop module).

## Growth engine

- **Content pillars:** Plant care tips; Plant glow-ups; Beginner plants
- **Shareable output:** Growth time-lapses and milestone cards

## Risks

Care advice must stay general; never promise plant health. Photos can add up, so compress them and keep cloud backup premium-only.

## Launch checklist

- [ ] Name checked on the App Store, Play Store and a trademark search
- [ ] MVP features done and tested
- [ ] Progression Loop wired (cue, tiny win, progress, milestone, next step)
- [ ] Privacy policy and terms
- [ ] Landing page
- [ ] Analytics wired (D1/D7/D30 retention)
- [ ] Payments / ads wired
- [ ] Added to the Growth & Maintenance Engine as an app config
