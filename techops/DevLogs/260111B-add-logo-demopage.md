# DevLog: 260111B - Add Logo & Voice Catalog Demo Page

**Date:** January 11, 2026
**Author:** SPOK
**Status:** Ready for Next Sprint
**Priority:** Phase 2 + Phase 8 completion

---

## Context

This sprint picks up from a massive successful session (260111A) where we:
- Built complete Voice Content API with metering (Phase 5)
- Implemented API key management system (Phase 6)
- Closed Phase 7 (drift.clinic = future API client, no migration needed)
- Reorganized project structure (techops/, bizops/)
- Verified production deployment

**What's left:** Logo finalization + public voice catalog page (which blocks Phase 8 doppel.center retirement)

---

## Objectives

### 1. Finalize Logo
**Status:** Drafts exist, need selection/implementation

Logo drafts in `bizops/assets/`:
- `doppel-talk-logo-draft1.svg`
- `doppel-talk-logo-draft2.png`
- `doppel-talk-logo-draft2.svg`

**Tasks:**
- [ ] Review drafts with CEO
- [ ] Select final logo
- [ ] Update favicon (`public/favicon.ico`)
- [ ] Update nav logo in `src/app/page.tsx` (currently uses Sparkles icon)
- [ ] Add to footer if desired

### 2. Build Public Voice Catalog Page
**Status:** Gap identified - doppel.talk has homepage demos but no browsable catalog

**Why this matters:**
- `voice-demos.doppel.center` has a full voice catalog (16 Polly voices)
- doppel.talk only has embedded demos on homepage
- Can't retire doppel.center until doppel.talk has feature parity
- This is a key sales/conversion tool - users browse before signup

**Reference - what voice-demos has:**
```
GET https://doppel.center/api/voices
→ Returns 16 voices with:
  - id, name, gender, language, accent, tone
  - tags, previewText, sampleAudioUrl
  - pricing info
```

**Tasks:**
- [ ] Create `/voices` or `/catalog` public route (no auth)
- [ ] Build voice card grid with:
  - Voice name, gender, language/accent
  - Play button for audio preview
  - Tags (professional, casual, etc.)
- [ ] Add filters: gender, language, accent, tone
- [ ] Add search
- [ ] Link from homepage "Browse Voices" CTA
- [ ] Consider: do we show Chatterbox house voices or just samples?

**Design considerations:**
- Keep consistent with existing doppel.talk design language
- Mobile-friendly grid
- Fast audio preview (preload metadata)

### 3. Retire doppel.center (Phase 8)
**Blocked by:** Voice catalog page completion

Once catalog is live:
- [ ] Verify doppel.talk catalog has feature parity
- [ ] Shut down Render deployment (doppel.center API)
- [ ] Shut down voice-demos.doppel.center (static frontend)
- [ ] Update/remove DNS records
- [ ] Archive local `~/projects/doppel.center/` folder

---

## Current Architecture

```
doppel.talk/
├── bizops/
│   ├── assets/          # Logo drafts, legal markdown
│   └── notes/           # DevLogs, strategy docs
├── techops/
│   ├── backend/         # Modal Chatterbox (tts.py)
│   └── postman/         # API collection
├── src/                 # Next.js app
├── prisma/              # Database schema
└── public/              # Static assets (favicon goes here)
```

---

## Key Files

| Purpose | Location |
|---------|----------|
| Homepage (has nav logo) | `src/app/page.tsx` |
| Favicon | `public/favicon.ico` |
| Logo drafts | `bizops/assets/doppel-talk-logo-draft*.{svg,png}` |
| Voice samples (S3) | `s3://doppel-talk/samples/voices/` |
| House voices dropdown | `src/app/(dashboard)/dashboard/create/page.tsx` (VOICE_FILES array) |

---

## API Endpoints Available

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/v/{slug}` | None | Public voice playback (Twilio-compatible) |
| `GET /api/v1/projects` | API Key | List user's projects |
| `GET /api/v1/usage` | API Key | Usage stats |
| `POST /api/v1/generate` | API Key | Generate speech |

**Postman collection:** `techops/postman/doppel-talk.postman_collection.json`

---

## Credentials

API keys stored in `~/.claude/credentials/DOPPEL-TALK-API-KEYS.md`:
- Local dev key: `dk_live_d14c68f23f0f8754fb3be2ec20cd5ebd`
- Production key: `dk_live_fbe64668df9f26a62774437ae0c884b9`

---

## Running Locally

```bash
cd ~/projects/doppel.talk
npm run dev
# → http://localhost:3000
```

---

## Previous Session Summary

**Commits from 260111A:**
1. `eef0ca7` - Legal pages + footer
2. `ed8befb` - Phase 1-4: cleanup, library enhancements
3. `35c4ca9` - Phase 5: Voice Content API + Postman
4. `d9b4141` - Phase 6: API Key Management
5. `b0494ce` - Directory reorganization (techops/bizops)

**Full devlog:** `bizops/notes/DevLogs/260111-strategy-update.md`

---

## Decision for Next Agent

The voice catalog page is the main blocker. Two approaches:

**Option A: Quick & Simple**
- Static page with hardcoded voice samples
- Just display the 9 voices currently in VOICE_FILES
- Get it live fast, iterate later

**Option B: Dynamic & Scalable**
- Create `/api/voices` endpoint
- Pull from database or config
- Full filtering/search
- More work but more flexible

Recommend discussing with CEO before starting.

---

## Open Questions

1. Which logo draft to use? (Need CEO input)
2. Static vs dynamic voice catalog? (See above)
3. Should catalog show pricing? (Current: credits-based, internal)
4. Do we need voice "categories" beyond the filter dimensions?

---

*Ready for next sprint. Voice catalog + logo = Phase 8 unblocked.*
