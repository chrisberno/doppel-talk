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
Twilio Paste (`@twilio-paste/core@^15.0.0`) requires React 16/17/18. Project uses React 19.2.3 (required by Next.js 16.0.1).

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

### 2. Polar Payment Integration

**Status:** Placeholder credentials only
**Date Identified:** 2026-01-07

**Issue:**
Polar.sh payment integration not configured. Using placeholder values:
- `POLAR_ACCESS_TOKEN=polar_placeholder_token`
- `POLAR_WEBHOOK_SECRET=polar_placeholder_secret`

**Action Required:**
1. Create Polar.sh account at https://polar.sh
2. Generate API access token
3. Configure webhook endpoint
4. Update Vercel environment variables with real values

---

### 3. AWS S3 Bucket Notifications

**Status:** Not configured
**Date Identified:** 2026-01-07

**Issue:**
S3 bucket `doppel-talk` needs event notifications configured to send updates to chris@chrisberno.dev

**Action Required:**
1. Configure S3 bucket event notifications (SNS or Lambda)
2. Set up email notifications for object creation/deletion
3. Or use CloudWatch alarms for bucket activity

---

## TODO (Post-Sprint)

### High Priority
- [ ] Configure Polar.sh payment integration with real credentials
- [ ] Set up S3 bucket notifications to chris@chrisberno.dev
- [ ] Fix doppel.center (currently broken on Render)
- [ ] Test TTS generation end-to-end with Modal backend
- [ ] Test authentication flow (sign up, sign in, sign out)

### Medium Priority
- [ ] Retrofit Twilio Paste components when React 19 supported
- [ ] Add www.doppel.talk redirect to doppel.talk
- [ ] Configure proper CORS on S3 bucket if needed
- [ ] Set up error monitoring (Sentry or similar)

### Low Priority
- [ ] Update Prisma to v7 (major version upgrade available)
- [ ] Clean up baseline-browser-mapping deprecation warning
- [ ] Add production logging/monitoring

---

## Completed Issues

### Infrastructure Setup (2026-01-07)
- [x] Configure production S3 bucket (`doppel-talk`)
- [x] Configure Modal backend deployment
- [x] Set up Vercel environment variables
- [x] Configure GitHub auto-deploy (push to main)
- [x] Configure doppel.talk custom domain
- [x] Rename branch from v2 to main
- [x] Create separate doppel-talk GitHub repo

---
