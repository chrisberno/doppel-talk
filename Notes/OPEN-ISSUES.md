# Doppel Talk v2.0 — Open Issues & TODOs

> **Last Updated:** 2026-01-07
> **Sprint:** v2.0 Initial Build

---

## Blocked / Deferred

### 1. Twilio Paste Integration (Phase 1.5)

**Status:** Deferred
**Blocked By:** React 19 incompatibility
**Date Identified:** 2026-01-06

**Issue:**
Twilio Paste (`@twilio-paste/core@^15.0.0`) requires React 16/17/18. Project uses React 19.0.0 (required by Next.js 16.1.1).

**Error:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer react@"^16.8.6 || ^17.0.2 || ^18.0.0" from @twilio-paste/animation-library@2.0.0
```

**Twilio Support Response (2026-01-06):**
No public ETA for React 19 support. Recommended deferring adoption.

**Workarounds Considered:**
| Option | Risk | Decision |
|--------|------|----------|
| `--legacy-peer-deps` | Runtime instability | Rejected |
| Downgrade to React 18 | Breaks Next.js 16 features | Rejected |
| Defer Paste adoption | None | **Selected** |

**Resolution Plan:**
- Monitor [Twilio Paste GitHub Discussions](https://github.com/twilio-labs/paste/discussions)
- Monitor [Paste Changelog](https://paste.twilio.design/changelog)
- Revisit when React 19 support is announced
- Current UI uses Tailwind CSS (can retrofit Paste later)

---

### 2. AWS S3 Bucket Notifications

**Status:** Deferred (admin feature, not blocking)
**Date Identified:** 2026-01-07

**Issue:**
S3 bucket `doppel-talk` event notifications not configured. Would send alerts to chris@chrisberno.dev on uploads/deletions.

**Why Deferred:**
- Zero impact on user experience
- Admin monitoring feature only
- Current AWS CLI user (`route53Admin`) lacks SNS permissions

**Action Required (when needed):**
1. In AWS Console: S3 → `doppel-talk` → Properties → Event notifications
2. Create SNS topic, subscribe chris@chrisberno.dev
3. Or use CloudWatch alarms for bucket activity

---

## TODO (Post-Sprint)

### High Priority
- [ ] Build TTS generation UI component
- [ ] Test credit purchase flow with Polar sandbox
- [ ] Test full TTS generation end-to-end (UI → Modal → S3)
- [ ] Configure www.doppel.talk redirect to doppel.talk

### Medium Priority
- [ ] Retrofit Twilio Paste components when React 19 supported
- [ ] Configure proper CORS on S3 bucket if needed
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Test password reset flow
- [ ] Add social auth providers (Google, GitHub)

### Low Priority
- [ ] Update Prisma to v7 (major version upgrade available)
- [ ] Clean up baseline-browser-mapping deprecation warning
- [ ] Add production logging/monitoring
- [ ] Consider doppel.center migration to Vercel

---

## Completed Issues

### Sprint: v2.0 Initial Build (2026-01-06 → 2026-01-07)

#### Infrastructure
- [x] Configure production S3 bucket (`doppel-talk`)
- [x] Configure Modal backend deployment
- [x] Fix Modal class typos (TextToSpeachServer → TextToSpeechServer)
- [x] Set up Vercel environment variables
- [x] Configure GitHub auto-deploy (push to main → production)
- [x] Configure doppel.talk custom domain
- [x] Rename branch from v2 to main
- [x] Create separate doppel-talk GitHub repo
- [x] Fix Vercel SSO Protection (was blocking public access)
- [x] Update Next.js to fix CVE-2025-66478 (16.0.1 → 16.1.1)

#### Payments & Auth
- [x] Configure Polar.sh sandbox integration
- [x] Set up Polar access token (sandbox)
- [x] Set up Polar webhook (sandbox)
- [x] Test authentication flow (sign up, sign in, sign out)

#### Documentation
- [x] Create deploy-instructions.md
- [x] Create initial devlog entry (250106-Initial-Setup-Deploy.md)
- [x] Update OPEN-ISSUES.md

#### Clarifications
- [x] Confirm doppel.center is working as designed (API-first at root, UI at voice-demos subdomain)

---

## Notes for Future Agents

1. **Polar Environment:** Code uses `server: "sandbox"` - create tokens at https://sandbox.polar.sh NOT https://polar.sh
2. **Vercel Account:** Always verify with `vercel whoami` - must be `chrisberno-dev`
3. **Modal Endpoint:** If you change the class name, the URL changes - update `MODAL_API_URL` in Vercel
4. **Read the devlog:** See `/Notes/DevLogs/250106-Initial-Setup-Deploy.md` for full context

---
