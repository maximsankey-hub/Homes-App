# Homes App — Roadmap

A running backlog of features and fixes. Pick items off this list to build next; check them off or delete as they ship.

## Your requested items

- [x] **Full-screen photo viewer** — clicking a media thumbnail (Visit tab, Overview) should open it in a large lightbox/overlay instead of the small grid tile. Also affects untagged media thumbnails.
- [x] **Editable score weighting during profile update** — the onboarding wizard ("Update profile" button) doesn't touch the weighting sliders at all right now; only the standalone Profile screen does. Fold weighting into the update flow.
- [x] **More onboarding questions** — expanded beyond the current fixed 8 preference tags; added a paced, categorized "priorities" deep-dive (healthy living, outdoor living, WFH, hosting, privacy, neighborhood/community, beauty & charm, walkability, pets, life-at-home) with yes/no and 1-10 importance questions, reachable from onboarding (opt-in, paced with a "keep going?" prompt after each topic) and anytime from the Profile screen (unpaced). Answers become property-level gradable criteria — see the custom-scoring-metrics item below.
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
- [x] **User-defined custom scoring metrics** — let the user add their own scoring metric (e.g. "accessibility"), alongside the built-in ones like natural light/storage, that can be scored per-room. When creating a custom metric, the user classifies it as either **emotional** or **functional**, and it factors into the room's emotional/functional averages alongside the built-ins. Setup/creation of new custom metrics only happens from the profile screen, which also got a weighting slider per custom metric (matching the existing built-in weight sliders). Property-level (not just room-level) custom scoring — done: `CustomMetric` now has a ROOM/PROPERTY `scope`; PROPERTY-scoped metrics (including all the priorities-questionnaire ones above) are graded once per house from a new "Priorities" card on the Visit tab, via a new `PropertyMetricScore` table.
- [x] **Room score breakdown when reviewing a past visit** — on the Visit tab when reviewing a previous visit, clicking a room should reveal the full score breakdown given for that room (storage, natural light, etc. — all the individual sliders), not just the summary. Summary view for the room list itself stays as-is; the breakdown only shows up on click.
  - **Editable after the fact** — from that same breakdown view, let the user adjust the individual scores for that room (not just view them) and save the changes.
- [x] **Add a renovation idea from live Visit mode** — the renovation-idea form (cost estimate — AI or manual, photo attachment) already exists on the property detail's Visit *sub-tab* (post-visit review screen); reused the same modal (already supported a pre-tagged room via its existing `room` context) and added an entry button to the live Visit *mode* scoring step, pre-tagged to whichever room you're currently on.
- [x] **Forgot password / reset password flow** — added a "Forgot password?" link on the login screen, a `/forgot-password` screen (Supabase `resetPasswordForEmail`), and a `/reset-password` screen (Supabase `updateUser({ password })`) for the emailed link to land on.
- [ ] **Reorder renovation ideas (Homes → Reno sub-tab)** — let the user drag/reorder the list of renovation ideas on a property's Reno sub-tab instead of the fixed creation order.
- [x] **Include neighborhood appeal in score weighting** — added a `weightNeighborhood` slider next to the existing weighting sliders (Profile screen and onboarding wizard). Note: `weightEmotional`/`weightStorage`/`weightLight`/`weightNeighborhood` are still stored as declared preferences but aren't wired into the property-score math — that's a separate, larger change across all four top-level sliders. (Per-metric `CustomMetric.weight`, a different and more granular kind of "importance," *is* now wired into the weighted-average scoring math as of the priorities-questionnaire work above.)
- [x] **Make "Score the neighborhood" more prominent on the Visit tab** — the entry point (in the live Visit mode room-picker step) is now a full-width accent card with icon, subtitle, and a checkmark/arrow state instead of a slim secondary button.

## Priorities questionnaire follow-ups (requested 2026-07-19)

Feedback after the priorities questionnaire + property-level grading shipped:

- [x] **Slider direction was unclear** — "Financial flexibility vs. dream house" and "Move-in ready vs. open to renovations" only labeled the slider once, in the middle, so it wasn't obvious which end meant which. Fixed with a new `PolaritySlider` component (opposite-end labels flanking the track) used in both the onboarding intro screen and the Profile screen.
- [x] **Toggling/dragging in the topic accordions felt buggy and delayed** — root cause was two things: (1) the importance sliders called the save API on *every* drag tick with no debounce, hammering the network and refetching the full metrics list dozens of times per drag; (2) the "Add"/"Matters to us" toggle button's pending state was shared across the whole mutation hook instance rather than per-item, so clicking one item could visually disable others. Fixed: `PriorityGroupCard` now holds local slider state and debounces the network commit (~350ms after the last change), toggle pending state is tracked per item, and the underlying `useCustomMetrics` mutations now update the cache optimistically (instant UI feedback instead of waiting on a round trip). Applied the same debounce fix to the pre-existing "Score weighting" sliders on the Profile screen since they had the identical issue.
- [x] **Hosting & guests missing a couple of metrics** — added "Ability to host a large dinner party" and "Space for outdoor games (bags, bocce)" to the catalog.
- [ ] **Pet type question** — if the intro question "Do you have a pet whose needs matter in this search?" is answered yes, ask what type(s): dog/cat/bird/rabbit as quick-pick options, plus a free-text "other" entry. Likely multi-select (a household could have more than one). Store on `PreferenceProfile` (e.g. a `petTypes: string[]` or a related small table if we want structured multi-select với "other" text).
- [ ] **Household composition / living situation question** — for data collection, not scoring: are you searching as a family (with/without kids), an individual (with/without roommates), for a rental property, etc. Suggest adding this to the "About your search" intro group alongside the pet question and the two ROI sliders. Needs a small enum + a few new `PreferenceProfile` fields (or one `householdComposition` field with an "other" free-text fallback, matching the pattern used for pet types above).
- [ ] **Pet-specific topic questions** — right now the "Pets" topic is generic regardless of pet type. Once pet type is captured, show a few general pet questions plus type-specific ones (e.g. dog → off-leash dog park access, fenced yard; cat → window perches, screened-in outdoor access; bird → noise tolerance/space; rabbit/other → flag as an open question since presets won't cover everything). Depends on the pet type question above shipping first.
- [ ] **Let users add a custom metric within any topic, not just the generic "Custom scoring metrics" card** — e.g. Walkability has a lot of nuance the fixed 4-item catalog won't fully cover. Add a lightweight "+ add your own" row at the bottom of each `PriorityGroupCard` that creates a `CustomMetric` pre-tagged to that group's category/scope, so custom ones live alongside the curated ones instead of only in the separate bottom-of-page section.
- [ ] **MAJOR — split the priorities catalog into room-specific vs. property-wide, and merge the Neighborhood + Priorities sections on the Visit tab.** Right now every catalog item is `scope: PROPERTY`, which was a deliberate simplification for the first version — but some items are clearly about one specific room (pantry space → Kitchen) and showing them at the property level, or showing property-wide ones inside every room's editor, doesn't make sense (was actually a live bug — the room editor listed *all* custom metrics regardless of scope; fixed today to filter to `scope: ROOM` only, so until this item ships no priorities-catalog questions will appear in room editors at all — that's correct behavior in the meantime, just less granular than the end goal).

  **What's needed to actually build this:**
  1. `CustomMetric` needs a way to target a specific room *type* when `scope: ROOM` (e.g. a nullable `targetRoomName` field) — today a ROOM-scoped metric shows up identically in every room, which doesn't work for "pantry space" only mattering in a Kitchen. Since users can also name rooms freely (custom room names, already shipped), matching should probably be case-insensitive against the room's name with a sensible fallback (e.g. hide the question, don't force it) when no room in the property matches.
  2. Each catalog item in `priorityQuestions.ts` needs a `scope` + optional `targetRoomName`, instead of the current flat "every item is PROPERTY."
  3. The Visit tab's "Neighborhood" and "Priorities" cards should merge into one section (e.g. "Property & Neighborhood") since most PROPERTY-scoped catalog items are really neighborhood/whole-home concerns, not meaningfully different from curb appeal/street vibe.

  **First-pass categorization** (my proposal — flagged items are genuinely ambiguous and worth deciding together rather than guessing):
  - **Kitchen**: Kitchen & pantry space for healthy cooking
  - **Backyard**: Backyard dog can access on their own; Yard space for our dog to run and play; Backyard size & usable space; Backyard privacy from neighbors; Low-maintenance yard / xeriscape potential; Space for a hot tub, fire pit, or dining area; Garden space; Neighbors can't easily see into the backyard or windows; Space for outdoor games (bags, bocce)
  - **Office**: Quiet, private room with natural light for an office; Home office / life-admin area
  - **Primary bed**: Bedrooms with good airflow & quiet for sleep; Vanity or dressing area
  - **Living room**: Comfortable gathering space to relax together
  - *Ambiguous, pick a room or leave property-wide*: Closet & organizational space (Primary bed vs. every bedroom); Quiet reading/study nook (Office vs. Living room vs. its own thing); Private space to be alone (Office vs. Secondary bed); Home gym/yoga/wellness space (no matching room preset exists today)
  - **Property/Neighborhood** (everything else — external amenities, layout-level traits, or neighborhood character): Gym or yoga studio nearby; Proximity to close friends & family; Off-leash dog park within walking distance or a short drive; Guest bedroom on the main floor for extended stays; Second guest bedroom on a separate floor for privacy; Space to comfortably host friends; Ability to host a large dinner party; Distance/screening from the sidewalk or street; Second-floor bedrooms for separation from street level; Active neighborhood association with regular events; Neighbors likely to share similar values/parenting style; Walkable local businesses we'd actually frequent; Historic character or architectural charm; High ceilings and abundant natural light; Walk to a major park within 15 min; Walk to a farmers market/grocery within 10 min; Walkable to kids' school; Errands without driving, overall

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

**Tour prep / due-diligence checklist**
- Distinct from the priorities questionnaire (preferences) — these are property *facts* to record while touring a house: roof/HVAC/electrical/plumbing/sewer inspection or replacement dates, mold check result. Plus simple checkboxes for "talked to the neighbors" and "researched the neighborhood association." Surface as a due-diligence card on the Visit tab, separate from grading.

**Nearby places**
- Replace the static seeded nearby-places data with a real maps/places API (Google Places, Mapbox) for genuinely live results

**Polish**
- Loading skeletons instead of plain "Loading…" text
- Installable PWA (add-to-home-screen, works more like a native app on a phone)
- Notifications/reminders (e.g. "you haven't finished scoring 512 Maple Avenue")

---
*Add new ideas anywhere in this file as they come to you — doesn't need to stay organized, just captured.*
