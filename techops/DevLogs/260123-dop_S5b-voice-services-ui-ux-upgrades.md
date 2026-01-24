# Sprint S5b: Doppel Voice Services - UI/UX Upgrades

**Date:** 2026-01-23 (Planning)
**Type:** Feature Sprint
**Status:** READY FOR DEVELOPMENT
**Depends On:** S4 (Ship The Wire) - ✅ COMPLETE

---

## Time Tracking

| Field | Value |
|-------|-------|
| Start | TBD |
| Stop | TBD |
| **Total** | **TBD** |

## Token Burn

| Category | Input | Output |
|----------|-------|--------|
| TBD | - | - |
| **Combined** | **TBD** | |

---

## Context for New Agent

### What Was Done (S4)

Two wires were shipped and verified working:

1. **CONSUME Wire:** BeaverDAM → Connie.plus → Audio plays in Twilio Flex CRM ✅
2. **CREATE Wire:** Connie.plus → Doppel API → Voice generated ✅

The API foundation is **solid**. This sprint focuses on **polishing the Doppel UI/UX** now that we have confidence the pipes work.

### System Architecture (Read This First)

```
DOPPEL (Create)          →    BEAVERDAM (Distribute)    →    ENDPOINTS (Consume)
─────────────────             ────────────────────────       ─────────────────────
Voice cloning                 Asset management              Connie, Twilio, etc.
TTS generation                Access control
S3 storage                    Usage logging
```

| System | Role | Analogy |
|--------|------|---------|
| Doppel | Creation (AI/ML) | Factory |
| BeaverDAM | Distribution (access/logging) | Warehouse |

**Key Insight:** Storage ≠ Distribution. Doppel creates, BeaverDAM distributes.

---

## Sprint Goals

Polish the Doppel `/dashboard/create` experience so users can easily:
1. Record voice samples directly in browser (no external upload)
2. Understand file relationships (sample → clone → published asset)
3. Activate assets for distribution via BeaverDAM

---

## Tasks

### Task 1: In-Browser Voice Recording (BL2)

**Problem:** Users must record voice samples externally and upload MP3 files. This is clunky.

**Solution:** Add browser-based voice recording to `/dashboard/create`.

**Requirements:**
- Record button with visual feedback (waveform/levels)
- 30-second minimum, 2-minute maximum
- Auto-convert to MP3 format
- Preview before submitting
- Clear "Re-record" option

**Files to Modify:**
- `src/app/dashboard/create/page.tsx`
- Create new component: `src/components/VoiceRecorder.tsx`

**Reference:** Web Audio API + MediaRecorder API

**Acceptance Criteria:**
- [ ] User can record voice sample without leaving browser
- [ ] Recording shows visual feedback
- [ ] User can preview and re-record
- [ ] Resulting MP3 uploads successfully to S3

---

### Task 2: File Architecture Clarity (BL9)

**Problem:** Users don't understand the relationship between:
- Voice sample (input)
- Voice clone (AI model)
- Generated audio (output)
- Published asset (distributed)

**Solution:** Visual clarity in the UI showing file relationships.

**Requirements:**
- Clear labeling: "Voice Sample" vs "Generated Audio"
- Visual flow diagram in UI
- Status indicators for each stage
- Prevent confusion between sample and clone

**Files to Modify:**
- `src/app/dashboard/page.tsx` (project list)
- `src/app/dashboard/create/page.tsx`

**Acceptance Criteria:**
- [ ] User clearly sees what's a sample vs what's a generated clone
- [ ] UI shows progression: Sample → Clone → Output
- [ ] No more confusion about which file is which

---

### Task 3: Asset Activation UI (BL6)

**Problem:** Generated audio stays in Doppel S3 but isn't automatically available via BeaverDAM for distribution.

**Solution:** "Activate" button that registers asset in BeaverDAM.

**Requirements:**
- Network/globe icon on generated audio projects
- Click to "Activate for Distribution"
- Shows status: "Local Only" vs "Activated"
- Calls BeaverDAM `register_asset` (see S5c sprint)

**Files to Modify:**
- `src/app/dashboard/page.tsx`
- Create: `src/actions/activate-asset.ts`

**Dependency:** Requires BeaverDAM `register_asset` API (Sprint S5c)

**Acceptance Criteria:**
- [ ] User can activate any generated audio for distribution
- [ ] Clear visual indicator of activation status
- [ ] Activated assets appear in BeaverDAM

---

## Credentials & Access

### Doppel Database (Neon PostgreSQL)

```
DATABASE_URL="postgresql://neondb_owner:npg_Poe7fYgw8HqC@ep-old-butterfly-ah57qql2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Get credentials via Vercel:**
```bash
cd /Users/cjberno/projects/chrisberno.dev/dev/doppel.talk
vercel env pull .env.prod --environment=production --yes
```

### Doppel API Key

```
DOPPEL_API_KEY=dk_live_d14c68f23f0f8754fb3be2ec20cd5ebd
```

### Test Account

- Email: `skyracer@mac.com`
- Credits: 97 remaining (bumped from 0 during S4)

### AWS S3 (Current - Connie's bucket, needs migration)

```
AWS_S3_BUCKET_NAME=doppel-talk
AWS_S3_BUCKET_URL=https://doppel-talk.s3.us-east-1.amazonaws.com
```

---

## Codebase Locations

| Project | Path | Repo |
|---------|------|------|
| Doppel.talk | `/Users/cjberno/projects/chrisberno.dev/dev/doppel.talk` | `chrisberno/doppel-talk` |
| BeaverDAM | `/Users/cjberno/projects/chrisberno.dev/dev/beaverdam` | (check git remote) |
| Connie.plus | `/Users/cjberno/projects/connie/connie.plus` | `ConnieML/connie-plus` |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `doppel.talk/src/app/dashboard/create/page.tsx` | Main create page (modify) |
| `doppel.talk/src/actions/voice-upload.tsx` | Voice upload action |
| `doppel.talk/src/actions/generate-speech.ts` | TTS generation |
| `doppel.talk/prisma/schema.prisma` | Database schema |
| `doppel.talk/techops/postman/` | API collection |

---

## API Reference

### Generate Speech (Creation)

```
POST https://doppel.talk/api/v1/generate
Authorization: Bearer dk_live_xxxx
Content-Type: application/json

{
  "text": "Text to convert",
  "voice_S3_key": "samples/voices/your-sample.mp3",
  "language": "en",  // NOT en-US
  "exaggeration": 0.5,
  "cfg_weight": 0.5,
  "name": "Project Name",
  "type": "greeting|ivr|announcement|promo"
}
```

**Note:** Language must be `en` not `en-US` (Chatterbox limitation).

---

## Definition of Done

- [ ] All tasks completed and tested
- [ ] No regressions in existing functionality
- [ ] DevLog updated with time/token burn
- [ ] Changes committed and pushed
- [ ] Production deployment verified

---

## Related Sprints

| Sprint | Focus | Status |
|--------|-------|--------|
| S4 | Ship The Wire | ✅ COMPLETE |
| **S5b** | **Doppel UI/UX** | **THIS SPRINT** |
| S5c | BeaverDAM MCP Tools | PLANNED |
| S5d | Doppel Infrastructure | PLANNED |

---

## Notes for CTO Agent

1. **Read S4 DevLog first:** `techops/DevLogs/260123-dop_S4-ship-the-wire.md`
2. **API is solid** - focus on UX, not plumbing
3. **Task 3 depends on S5c** - can stub with TODO if BeaverDAM tools not ready
4. **Test locally before deploy** - Vercel preview deployments work well
5. **Backlog file has more context:** `/Users/cjberno/Desktop/thewire-backlog.md`

---

*"The API foundation is solid. Now make it beautiful."*
