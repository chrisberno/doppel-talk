# Sprint: Ship The Wire (Doppel ↔ BeaverDAM ↔ Connie)

**Date:** 2026-01-23
**Type:** Integration Sprint
**Author:** SPOK + CEO

---

## Time Tracking

| Field | Value |
|-------|-------|
| Start | 10:00 AM |
| Stop | 3:30 PM |
| **Total** | **5h 30m** |

## Token Burn (Estimated)

| Category | Input | Output |
|----------|-------|--------|
| File reads (~25 files) | ~40,000 | - |
| Tool calls (~80 bash/edit/mcp) | ~15,000 | ~10,000 |
| Dialogue (heavy architectural) | ~20,000 | ~35,000 |
| System context | ~5,000 | - |
| **Total** | **~80,000** | **~45,000** |
| **Combined** | **~125,000 tokens** | |

*Note: Extended session with significant architectural planning, cross-project integration, and production deployment.*

---

## Mission

> "The pipeline is the product. Ship the wire."

Prove end-to-end pipeline works: **Doppel (Create) → BeaverDAM (Protect) → Connie (Consume)**

---

## Accomplishments

### Wire 1: Consume (BeaverDAM → Connie) ✅

| Step | Action | Status |
|------|--------|--------|
| 1 | Clone .mp3 exists in S3 | ✅ DONE |
| 2 | Register in BeaverDAM | ✅ DONE - ID: `7ca63a5e-267b-48be-a5c2-68604786e169` |
| 3 | Connie requests via BeaverDAM API | ✅ DONE |
| 4 | BeaverDAM delivers + auth works | ✅ DONE - Bearer token |
| 5 | Audio plays in Twilio Flex CRM | ✅ DONE |

**Files Created:**
- `/pages/api/beaverdam/asset.ts` - proxy route with Bearer auth
- `/pages/demos/doppel-voice.tsx` - IVR voice demo page

### Wire 2: Create (Connie → Doppel API) ✅

| Step | Action | Status |
|------|--------|--------|
| 1 | Proxy route for Doppel API | ✅ DONE |
| 2 | Voicemail Builder UI | ✅ DONE |
| 3 | API call from Connie → Doppel | ✅ DONE |
| 4 | Voice generated successfully | ✅ DONE |

**Files Created:**
- `/pages/api/doppel/generate.ts` - proxy route for voice generation
- `/pages/demos/voicemail-builder.tsx` - voicemail builder UI

**Fixes Applied:**
- Language code: `en` not `en-US` (Chatterbox requirement)
- Credits bumped from 0 → 100 for `skyracer@mac.com`

---

## Architecture Documented

### System Roles

| System | Role | Analogy |
|--------|------|---------|
| Doppel | Creation (AI/ML) | Factory |
| BeaverDAM | Distribution (access/logging) | Warehouse |

### Data Flows

**CREATE Flow:**
```
Client (Connie) → Doppel API → Clone created → S3
```

**CONSUME Flow:**
```
Client (Connie) → BeaverDAM API → Asset delivered + logged
```

**Full Loop Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│   CONNIE (or any API client)                                │
│                                                             │
│      │ CREATE                              CONSUME │        │
│      ▼                                            ▼        │
│   ┌──────────┐                            ┌────────────┐   │
│   │  Doppel  │ ──register asset──────────▶│ BeaverDAM  │   │
│   │   API    │                            │    API     │   │
│   └──────────┘                            └────────────┘   │
│        │                                        │          │
│        ▼                                        ▼          │
│      [S3]◀──────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Business Model (Tiers)

| Tier | Access |
|------|--------|
| Free | doppel.talk UI only |
| Bronze | API access (white-label in your app) |
| Silver+ | Higher rate limits, priority, etc. |

### White-Label Concept

Doppel.talk's "/create" page is just ONE UI calling the Doppel API.
Connie.plus (or any client) can embed voice creation directly via the same API.

```
doppel.talk/create  ──┐
                      ├──→  Doppel Creation API  ──→  Clone
connie.plus/create  ──┘
```

**Doppel becomes infrastructure, not destination.**

---

## Production Deployments

### Connie.plus (EC2)

**Commits:**
```
957961c - feat: Add Doppel Voice IVR demo with BeaverDAM integration
cff8e9c - feat: Add Voicemail Builder with Doppel API integration
```

**Env Vars Added:**
- `BEAVERDAM_TOKEN` - for asset consumption
- `DOPPEL_API_KEY` - for voice generation

**Live URLs:**
- https://connie.plus/demos/doppel-voice ✅
- https://connie.plus/demos/voicemail-builder ✅

### Navigation Updated

Added "Voice Builder Tools" section to `/demos/connie-broadcast.tsx`:
- IVR Builder → /demos/doppel-voice (Active)
- Voicemail Builder → Notion PRD (Coming Soon)
- Voice Broadcasting → Notion PRD (Coming Soon)

---

## Identified Gaps (Backlog)

| # | Item | Project | Notes |
|---|------|---------|-------|
| BL1 | Doppel using Connie's S3 - needs own bucket | doppel | Can't stay on Connie grid |
| BL2 | External recording clunky - capture voice directly | doppel | Better UX for clone intake |
| BL9 | File architecture - what is a "true doppel"? | doppel | Transcripts, samples, clones |
| BL10 | Add `register_asset` MCP tool | beaverdam | Auto-register after creation |
| BL11 | Add `upload_asset` MCP tool | beaverdam | Direct file upload via MCP |
| BL12 | Add `log_access` MCP tool | beaverdam | Track consumption |

### Critical Gap: Handoff

After Doppel creates a file, it's stored in S3 but **NOT auto-registered in BeaverDAM**.

Current: `Doppel API → S3 → Doppel DB` (stops here)
Needed: `Doppel API → S3 → Doppel DB → BeaverDAM` (completes loop)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `/Users/cjberno/Desktop/thewire-backlog.md` | Sprint tracking + architecture gold |
| `connie.plus/pages/api/beaverdam/asset.ts` | BeaverDAM proxy (consume) |
| `connie.plus/pages/api/doppel/generate.ts` | Doppel proxy (create) |
| `connie.plus/pages/demos/doppel-voice.tsx` | IVR demo page |
| `connie.plus/pages/demos/voicemail-builder.tsx` | Voicemail builder page |
| `doppel.talk/techops/postman/` | API collection + environments |
| `beaverdam/notes/PAC-permissions-assets-credentials.md` | BeaverDAM credentials |

---

## Lessons Learned

1. **"Ship the wire"** - Prove pipes work before polishing UX
2. **Separation of concerns** - Creation ≠ Distribution (Netflix model)
3. **API is the product** - UI is just one client; white-label via API
4. **Backlog discipline** - Capture rabbit holes, don't chase them
5. **Architecture confidence** - Test the wire, then invest in polish

---

## Next Steps (Sprint Candidates)

1. **Complete the loop** - Auto-register Doppel outputs in BeaverDAM
2. **Polish Doppel /create UX** - Now safe to invest (API is solid)
3. **Add navigation links** - Make voicemail-builder accessible from Flex
4. **Doppel gets own S3** - Separate from Connie infrastructure

---

## Mantras

> "The pipeline is the product."

> "Ship the wire."

> "Storage ≠ Distribution."

---

*Both wires verified working in production.*
*Full backlog at: `/Users/cjberno/Desktop/thewire-backlog.md`*
