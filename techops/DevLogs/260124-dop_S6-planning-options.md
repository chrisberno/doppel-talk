# Sprint S6: Planning Options

**Date:** 2026-01-24
**Status:** NOT STARTED - Options for CEO review
**Depends On:** S5 Series (all complete)

---

## S5 Recap: What Just Shipped

- Voice Cloning Studio (in-browser recording)
- 23 Professional Voice Agents
- Script Book (Draft → Production → Archived)
- Project Assembly (Voice + Script = Project)
- BeaverDAM integration on publish
- MCP tools for AI agents

**Architecture established:** Studio → Network

---

## S6 Direction Options

### Option A: API Hardening
*"Make the API bulletproof for 3rd party consumers"*

| Task | Description |
|------|-------------|
| Full API Integration Test | Validate generate → fetch → play loop with Connie |
| Webhooks | Notify consumers when generation complete |
| Batch Generation | Multiple outputs in one API call |
| API Documentation | OpenAPI spec, examples, SDKs |

**Who it serves:** Twilio, Connie, future partners
**Risk if skipped:** API works in isolation but not validated end-to-end

---

### Option B: User Experience Polish
*"Make the product delightful to use"*

| Task | Description |
|------|-------------|
| Canned Scripts | Pre-made templates (IVR, voicemail, greeting) |
| Voice Preview | Hear sample quality before cloning |
| Share Draft for Review | Collaboration before publish |
| Onboarding Flow | Guide new users through first project |

**Who it serves:** Direct users, self-service customers
**Risk if skipped:** Users figure it out, but friction remains

---

### Option C: Infrastructure Independence
*"Own your stack"*

| Task | Description |
|------|-------------|
| Own S3 Bucket | Separate from Connie's AWS |
| Tier Logic | Free vs Bronze enforcement |
| Rotate Neon Password | Security (GitGuardian alert) |
| BeaverDAM Production Activation | Add env vars to Vercel |

**Who it serves:** Business operations, security
**Risk if skipped:** Dependency on shared infrastructure, security debt

---

### Option D: AI Features
*"Differentiate with intelligence"*

| Task | Description |
|------|-------------|
| AI Script Generation | Generate scripts from prompts |
| Voice Recommendations | Suggest voices based on script type |
| Auto-tagging | AI-generated metadata |

**Who it serves:** Power users, marketing
**Risk if skipped:** Competitors may move faster

---

## Required Testing (Any Direction)

**API Integration Validation** - Not yet proven end-to-end:

```
Connie.plus → calls /api/v1/generate → gets audio URL → plays to caller
```

Yesterday's test proved playback works. Full generation loop not validated.

**Recommended Test:**
1. Create API key for Connie
2. Connie calls `/api/v1/generate` with voice + script
3. Connie receives audio URL in response
4. Connie plays audio via Twilio
5. Confirm full loop works

**Effort:** ~1 hour
**Value:** De-risks entire "API for 3rd parties" story

---

## Security Item (Carry Forward)

| Item | Priority | Notes |
|------|----------|-------|
| Rotate Neon DB password | HIGH | GitGuardian alert 2026-01-23 |

---

## Decision Framework

| If you want to... | Choose |
|-------------------|--------|
| Sell to developers/partners | Option A |
| Grow direct users | Option B |
| Reduce operational risk | Option C |
| Build competitive moat | Option D |

Or mix: e.g., "A + C" = API hardening + infrastructure independence

---

## No Rush

S5 was a massive sprint. The product works. Take time to:
- Use it yourself
- Show it to people
- Let feedback inform S6 direction

---

*"Shipped is better than perfect. Reflection is better than rushing."*
