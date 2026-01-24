# Sprint S5d: Doppel Infrastructure - Independence & Scale

**Date:** 2026-01-23 (Planning)
**Type:** Infrastructure Sprint
**Status:** PLANNED (Lower Priority)
**Depends On:** S4 ✅, S5b, S5c

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

### Current State

Doppel.talk is functional but has infrastructure debt:

1. **Using Connie's S3 bucket** - Doppel assets stored in `doppel-talk` bucket under Connie's AWS account
2. **No tier enforcement** - Free vs Bronze logic not implemented
3. **No agent library** - Only custom voice clones, no pre-made voices

### Why This Matters

- **Billing separation:** Doppel can't track its own AWS costs
- **Security boundary:** Doppel shouldn't depend on Connie's credentials
- **Scale:** Need independent infrastructure for growth

---

## Sprint Goals

Establish Doppel as an independent product with its own infrastructure.

---

## Tasks

### Task 1: Doppel's Own S3 Bucket (BL1)

**Problem:** Doppel uses Connie's AWS account and S3 bucket.

**Solution:** Create dedicated AWS account or IAM user for Doppel.

**Requirements:**
- New S3 bucket: `doppel-voices` or similar
- IAM user with minimal permissions
- CORS configured for doppel.talk
- Migration plan for existing assets

**Implementation Steps:**
1. Create IAM user in AWS (or new account)
2. Create S3 bucket with proper config
3. Update Vercel env vars
4. Migrate existing assets (optional, or leave old ones)
5. Update upload paths in code

**Files to Modify:**
- `src/actions/voice-upload.tsx`
- `src/lib/s3.ts` (if exists)
- Vercel environment variables

**Credentials Needed:**
- New AWS Access Key ID
- New AWS Secret Access Key
- New bucket name and URL

**Acceptance Criteria:**
- [ ] New S3 bucket created and accessible
- [ ] Doppel code uses new bucket
- [ ] Old assets still accessible (or migrated)
- [ ] Connie's AWS credentials removed from Doppel

---

### Task 2: Free vs Bronze Tier Logic (BL3)

**Problem:** Business model defines tiers but logic isn't enforced.

**Tiers Defined:**
| Tier | Access |
|------|--------|
| Free | doppel.talk UI only, limited credits |
| Bronze | API access, white-label capability |
| Silver+ | Higher rate limits, priority |

**Solution:** Implement tier checking in API routes.

**Requirements:**
- User model has `tier` field (or derive from Polar subscription)
- API routes check tier before allowing access
- Clear error messages for tier-blocked actions
- Upgrade prompts in UI

**Files to Modify:**
- `prisma/schema.prisma` (add tier field if needed)
- `src/app/api/v1/*` routes
- `src/lib/auth.ts` or middleware

**Integration with Polar:**
- Check Polar subscription status
- Map Polar plans to tiers
- Handle subscription changes

**Acceptance Criteria:**
- [ ] Free users can only use UI
- [ ] Bronze users get API access
- [ ] Clear upgrade path in UX
- [ ] Tier synced with Polar subscription

---

### Task 3: Agent Library / Pre-made Voices (BL4)

**Problem:** Users must clone their own voice. No pre-made options.

**Solution:** Library of pre-made AI voices users can select.

**Requirements:**
- Curated library of voice samples
- Voice preview/audition capability
- Easy selection in create flow
- Clear licensing/attribution

**Implementation:**
- Seed database with library voices
- UI component for voice browser
- Integration with generate flow

**Files to Modify:**
- `prisma/schema.prisma` (LibraryVoice model?)
- `src/app/dashboard/create/page.tsx`
- New: `src/components/VoiceLibrary.tsx`

**Acceptance Criteria:**
- [ ] User can browse pre-made voices
- [ ] Can preview voices before selecting
- [ ] Can generate audio with library voice
- [ ] Clear distinction from custom clones

---

## Credentials & Access

### Current AWS (Connie's - TO BE REPLACED)

```
AWS_S3_BUCKET_NAME=doppel-talk
AWS_S3_BUCKET_URL=https://doppel-talk.s3.us-east-1.amazonaws.com
```

### Polar (Payment/Subscription)

Check Vercel env for:
```
POLAR_ACCESS_TOKEN=xxx
POLAR_WEBHOOK_SECRET=xxx
```

### Doppel Database

```
DATABASE_URL="postgresql://neondb_owner:npg_Poe7fYgw8HqC@ep-old-butterfly-ah57qql2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

## Codebase Location

```
/Users/cjberno/projects/chrisberno.dev/dev/doppel.talk
```

---

## Priority Order

1. **Task 1 (S3)** - Most critical for independence
2. **Task 2 (Tiers)** - Enables monetization
3. **Task 3 (Library)** - Nice to have, improves UX

Tasks 2 and 3 can be done in parallel after Task 1.

---

## Definition of Done

- [ ] Doppel has own AWS/S3 infrastructure
- [ ] Tier logic enforced in API
- [ ] Voice library available (if included)
- [ ] DevLog updated
- [ ] Production verified

---

## Related Sprints

| Sprint | Focus | Status |
|--------|-------|--------|
| S4 | Ship The Wire | ✅ COMPLETE |
| S5b | Doppel UI/UX | PLANNED |
| S5c | BeaverDAM MCP Tools | PLANNED |
| **S5d** | **Doppel Infrastructure** | **THIS SPRINT** |

---

## Notes for CTO Agent

1. **Task 1 is most critical** - Everything else works on borrowed infrastructure
2. **Coordinate with CEO on AWS** - May need new account or IAM setup
3. **Polar integration exists** - Check existing webhook handlers
4. **Voice library is optional** - Can defer if time constrained
5. **Test migration carefully** - Don't break existing assets

---

*"Independence enables scale. Cut the umbilical cord."*
