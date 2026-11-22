# Thirsty: Spec

**Keep your plants alive** · #15 of 33 in the build order · Easy · Revenue potential: Low–medium · Family, Pets & Plants · Source: New (Claude)

## One-liner

Add your plants, pick a type, and Thirsty reminds you when each one needs water or feeding. Log care in one tap and keep a photo diary of each plant growing.

## Problem / audience

- **Who it's for:** Houseplant owners, especially new ones who keep killing plants.
- **The problem it solves:** People forget to water, or over-water because they can't remember when they last did.
- **Example:** A user with eight plants gets a Sunday reminder for three of them, taps 'watered', and adds a monthly photo of their monstera.

## MVP features (ship with only these)

1. Plant list with care presets by type
2. Watering and feeding reminders
3. One-tap 'watered' log
4. Photo diary per plant
5. 'All plants happy' streak

## Not in MVP

- Seasonal schedule adjustments
- Household sharing
- Care guides

## Monetisation

| Model | Detail |
|---|---|
| Free | Up to 5 plants, with ads |
| Premium | £1.49/month or £7.99 lifetime: unlimited plants, photo diary, sharing |
| Affiliate | Plant-care products, clearly labelled |

Prices are starting points; test before committing.

## Retention: The Progression Loop

| Stage | Design |
|---|---|
| Cue | Watering reminders |
| Tiny win | Tap 'watered' |
| Progress | Healthy-plant streak and photo timelines |
| Share | Plant growth photos |
| Next step | Suggest adding a new plant |
| Cadence | Weekly |

Follow the portfolio guardrails: no guilt-trip notifications, no fake urgency, progress is
never wiped, at most one notification a day by default.

## Platform & data

- **Platform:** Expo app.
- **Data:** On the device only.
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob, shared Progression Loop module).

## Growth engine

- **Content pillars:** Plant care tips; Plant glow-ups; Beginner plants
- **Shareable output:** Plant growth photos

## Risks

Care advice must stay general; never promise plant health.

## Launch checklist

- [ ] Name checked on the App Store, Play Store and a trademark search
- [ ] MVP features done and tested
- [ ] Progression Loop wired (cue, tiny win, progress, milestone, next step)
- [ ] Privacy policy and terms
- [ ] Landing page
- [ ] Analytics wired (D1/D7/D30 retention)
- [ ] Payments / ads wired
- [ ] Added to growth-engine as an app config
