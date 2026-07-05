# Homes App — Roadmap

A running backlog of features and fixes. Pick items off this list to build next; check them off or delete as they ship.

## Your requested items

- [x] **Full-screen photo viewer** — clicking a media thumbnail (Visit tab, Overview) should open it in a large lightbox/overlay instead of the small grid tile. Also affects untagged media thumbnails.
- [x] **Editable score weighting during profile update** — the onboarding wizard ("Update profile" button) doesn't touch the weighting sliders at all right now; only the standalone Profile screen does. Fold weighting into the update flow.
- [ ] **More onboarding questions** — expand beyond the current fixed 8 preference tags; add more depth to the "what matters most" and free-text steps.
- [ ] **Room-specific aesthetic photos** — the onboarding swipe step only asks about kitchen style (4 emoji placeholders). Add swipe decks for bedrooms, bathrooms, backyards, etc., ideally with real photos instead of emoji.
- [x] **Custom room names in Visit mode** — right now room choice is a fixed list (Kitchen, Living room, Primary bed, Backyard, Garage, Office). Add a "type your own" option, plus more presets: Basement, Bathroom, Secondary Bedroom.
- [x] **Photo capture on the scoring screen** — Visit mode's step 1 (the 4 sliders + quick-thoughts note) has no capture buttons; only the room-picker step and the reflection step do. Add capture there too.
- [x] **Multi-user accounts + authentication** — biggest item on this list. See "Accounts & Auth" section below for what this actually involves.

## Bugs worth fixing

- [x] **"Update profile" doesn't load your current profile** — the onboarding wizard always starts from hardcoded defaults instead of pre-filling your actual saved tags/aesthetic style, so re-running it silently discards prior answers until you re-pick everything.
- [x] **No way to edit a property** — once added, a property's address/price/sqft/etc. can't be corrected, only re-entered from scratch.
- [x] **No way to delete anything** — properties, renovation ideas, improvement ideas, and media are all add-only. A typo or duplicate sticks around forever.
- [x] **Reseeding wipes everything, not just demo data** — running the seed script deletes *all* properties/scores/media, including anything you've genuinely added, with no "reset demo only" option. Fixed via a `Property.isDemo` flag and a new `npm run db:seed:demo` command that only replaces the 3 seeded demo properties (and untouched profile/listing/scorers if they already exist).
- [x] **"Invite a partner" doesn't let the partner actually do anything** — it creates a named scorer, but there's no way for that person to log in and submit their own room scores (ties directly into the Accounts & Auth item). Fixed alongside real auth: the household's invite code is now enterable at signup, and a real second account joins as PARTNER and scores as themselves.
- [x] **Starting a new visit always defaults to the Elm St house** — there's no way to pick which property you're visiting; add a property selector when starting a visit so it isn't hardcoded/defaulted.
- [x] **New room scores default to odd pre-populated numbers instead of neutral 5/10** — Visit mode's sliders for a never-scored room started at (7, 5, 8, 9); now default to a neutral 5 across the board.

## Accounts & Auth (the big one) — shipped

Real multi-user support, built as a shared-household model:
- Email + password auth via Supabase Auth (client talks to Supabase directly; the API verifies the bearer token per request)
- A `Household` now owns `Property`/`PreferenceProfile`/`Listing`; every route is scoped by the logged-in user's household
- Signing up with no invite code creates a brand-new empty household; signing up with an invite code (shown in the Drawer, copyable) joins an existing one as SELF or PARTNER
- Your original account (matching `LEGACY_HOUSEHOLD_OWNER_EMAIL` in `server/.env`) automatically inherits the pre-auth demo/real data on first signup
- Not included yet: password reset, editing your display name/color after joining, and Postgres RLS (not needed — the API is the only thing that ever talks to Postgres, so it's already the authorization boundary)

## Newly requested items

- [x] **Add renovation ideas from the Visit page** — currently reno ideas can only be added elsewhere; add the ability to create one directly while on the main Visit page. Two entry points: (1) while scoring a specific room, add a reno idea pre-tagged to that room, or (2) add a general reno idea with no room tag and assign it to a room afterward. Both paths should feel natural, not bolted on.
  - **Cost estimation on the add-reno-idea form** — when creating a reno idea, let the user choose between:
    1. AI-estimated cost range — user types a short free-text description, AI returns an estimated cost range. For now, stub this with dummy/mock data; wire up the real Claude API call later (same pattern as the existing "AI insights" mock-to-real swap-in below).
    2. Manual cost entry — user types in their own expected cost directly.
  - **Photos tagged to a renovation idea** — let the user attach pictures directly to a reno idea (not just to a room), so viewing a reno idea shows the photos tied to it specifically.
- [ ] **Auto-fill property details from an address (Zillow)** — when adding/editing a property, let the user enter just the address and pull in list price, sq ft, bed/bath count, and year built automatically instead of typing each field by hand. Real MLS data is gated behind broker/MLS-board sponsorship (RESO Web API via MLS Grid, or Zillow's Bridge Interactive feed) — no free public tier exists for either. Realistic options for this app:
  - **RentCast API** — free tier (~50 requests/month); returns sqft/beds/baths/year built plus an estimated value. Best starting point.
  - **County assessor / property tax open data portals** — genuinely free, authoritative for sqft/year built/bed-bath count (public record). No list price, since that's private MLS data — would still need manual entry for price. Coverage/format varies by county.
  - **Unofficial scraper APIs (RapidAPI "Zillow"/"Redfin" listings)** — free tiers exist but scrape rather than use an official feed, violate ToS, and can break without notice. Fine for a quick prototype, not for anything long-term.
  - **Paid property-data APIs (ATTOM, Estated, HouseCanary)** — more robust, but full access costs money.
  - Likely approach: RentCast/county data for structural facts, manual entry for list price. Flag as a research spike before implementation.
- [x] **Score "neighborhood feel" during a visit** — add a separate scoring step, distinct from individual room scoring, for the overall look/feel of the neighborhood (e.g. curb appeal, street/block vibe). This should factor into the property's overall score alongside the room scores, not just be a standalone note.
- [x] **Pre-populate previous scores on a revisit** — if a property already has a prior visit, starting a new visit should pre-fill all previous selections (room scores, and neighborhood feel once that exists) instead of starting blank, since you can rescore anything on a revisit but usually you're just confirming/tweaking, not starting over.
- [ ] **User-defined custom scoring metrics** — let the user add their own scoring metric (e.g. "accessibility"), alongside the built-in ones like natural light/storage, that can be scored per-room or per-property. When creating a custom metric, the user classifies it as either **emotional** or **functional**. Setup/creation of new custom metrics only happens from the profile screen (during profile creation/update) — not mid-visit; once defined, the metric becomes available to score like any other during a visit.
- [x] **Room score breakdown when reviewing a past visit** — on the Visit tab when reviewing a previous visit, clicking a room should reveal the full score breakdown given for that room (storage, natural light, etc. — all the individual sliders), not just the summary. Summary view for the room list itself stays as-is; the breakdown only shows up on click.
  - **Editable after the fact** — from that same breakdown view, let the user adjust the individual scores for that room (not just view them) and save the changes.

## Other feature ideas worth considering

**Media & Visit mode**
- Real camera/microphone capture (using the device's camera/mic directly) instead of only picking existing files
- Compress/resize photos before upload (faster uploads, less Supabase Storage usage)
- Reorder photos within a room (delete is now supported, from the lightbox or the untagged-media tag prompt)

**Data management**
- Search/filter on the Homes list (matters once you're tracking more than a handful of properties)
- Archive a property instead of only ever adding more

**AI insights**
- Wire the "AI insights" cards to real Claude API calls instead of the current rule-based mock logic (the code's already structured so this is a swap-in, not a rewrite)

**Nearby places**
- Replace the static seeded nearby-places data with a real maps/places API (Google Places, Mapbox) for genuinely live results

**Polish**
- Loading skeletons instead of plain "Loading…" text
- Installable PWA (add-to-home-screen, works more like a native app on a phone)
- Notifications/reminders (e.g. "you haven't finished scoring 512 Maple Avenue")

---
*Add new ideas anywhere in this file as they come to you — doesn't need to stay organized, just captured.*
