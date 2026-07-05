# Homes App — Roadmap

A running backlog of features and fixes. Pick items off this list to build next; check them off or delete as they ship.

## Your requested items

- [ ] **Full-screen photo viewer** — clicking a media thumbnail (Visit tab, Overview) should open it in a large lightbox/overlay instead of the small grid tile. Also affects untagged media thumbnails.
- [ ] **Editable score weighting during profile update** — the onboarding wizard ("Update profile" button) doesn't touch the weighting sliders at all right now; only the standalone Profile screen does. Fold weighting into the update flow.
- [ ] **More onboarding questions** — expand beyond the current fixed 8 preference tags; add more depth to the "what matters most" and free-text steps.
- [ ] **Room-specific aesthetic photos** — the onboarding swipe step only asks about kitchen style (4 emoji placeholders). Add swipe decks for bedrooms, bathrooms, backyards, etc., ideally with real photos instead of emoji.
- [ ] **Custom room names in Visit mode** — right now room choice is a fixed list (Kitchen, Living room, Primary bed, Backyard, Garage, Office). Add a "type your own" option, plus more presets: Basement, Bathroom, Secondary Bedroom.
- [ ] **Photo capture on the scoring screen** — Visit mode's step 1 (the 4 sliders + quick-thoughts note) has no capture buttons; only the room-picker step and the reflection step do. Add capture there too.
- [ ] **Multi-user accounts + authentication** — biggest item on this list. See "Accounts & Auth" section below for what this actually involves.

## Bugs worth fixing

- [ ] **"Update profile" doesn't load your current profile** — the onboarding wizard always starts from hardcoded defaults instead of pre-filling your actual saved tags/aesthetic style, so re-running it silently discards prior answers until you re-pick everything.
- [ ] **No way to edit a property** — once added, a property's address/price/sqft/etc. can't be corrected, only re-entered from scratch.
- [ ] **No way to delete anything** — properties, renovation ideas, improvement ideas, and media are all add-only. A typo or duplicate sticks around forever.
- [ ] **Reseeding wipes everything, not just demo data** — running the seed script deletes *all* properties/scores/media, including anything you've genuinely added, with no "reset demo only" option.
- [ ] **"Invite a partner" doesn't let the partner actually do anything** — it creates a named scorer, but there's no way for that person to log in and submit their own room scores (ties directly into the Accounts & Auth item).

## Accounts & Auth (the big one)

Real multi-user support touches a lot of the app:
- Sign-up/login (Supabase Auth would be a natural fit since you're already on Supabase — email/password or magic link, minimal extra infrastructure)
- Each user gets their own properties/profile/listing instead of the current single-household model
- "Invite a partner" becomes a real invite — the partner logs in, joins your household/property, and scores rooms as themselves
- Decide: fully separate households, or a shared "household" concept multiple people belong to?

## Other feature ideas worth considering

**Media & Visit mode**
- Real camera/microphone capture (using the device's camera/mic directly) instead of only picking existing files
- Compress/resize photos before upload (faster uploads, less Supabase Storage usage)
- Reorder or delete individual photos within a room

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
