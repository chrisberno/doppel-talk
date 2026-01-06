# Doppel Center v2.0 — Open Issues & TODOs

> **Last Updated:** 2026-01-06
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

## TODO (Post-Sprint)

- [ ] Retrofit Twilio Paste components when React 19 supported
- [ ] Update infrastructure references (`ai-voice-studio-sahand`) to production values
- [ ] Configure production S3 bucket and Modal app
- [ ] Set up Vercel environment variables for production deploy

---

## Completed Issues

_(Move resolved items here with resolution date)_

---
