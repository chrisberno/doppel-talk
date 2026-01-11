# Doppel Talk Deployment Instructions

**MANDATORY: Any agent deploying this project MUST read and acknowledge this document before proceeding.**

---

## Pre-Deployment Checklist

### 1. Verify Vercel Account

Before ANY deployment action, confirm the correct Vercel account:

```bash
vercel whoami
```

**Expected account:** `chrisberno-dev` (tied to chris@chrisberno.dev)

If the wrong account is shown:
```bash
vercel logout
vercel login
```

**WARNING:** During initial setup, we nearly deployed to the wrong account. This check is critical.

### 2. Verify Project Linking

Check if the project is linked to the correct Vercel project:

```bash
vercel ls
```

Look for `doppel.talk` in the list. If not present or linked to wrong project:

```bash
rm -rf .vercel
vercel link
```

Follow prompts to link to the correct project/team.

---

## Recommended Deployment Workflow

### Standard Deploy (PREFERRED)
```bash
git add .
git commit -m "your message"
git push origin main
```

GitHub auto-deploy is configured. Pushing to `main` triggers production build automatically.

**DO NOT use `vercel --prod` CLI deploys unless absolutely necessary.**

### Modal Backend Deploy
```bash
cd backend/text-to-speech
modal deploy tts.py
```

**Important:** If you rename the Modal class, the endpoint URL changes. You must update `MODAL_API_URL` in Vercel.

---

## Environment Variables

The following environment variables are configured in Vercel Production:

### Database (Neon)
- `DATABASE_URL` - Neon PostgreSQL connection string

### Auth (Better Auth)
- `BETTER_AUTH_SECRET` - Secure random string (32+ chars)
- `BETTER_AUTH_URL` - `https://doppel.talk`

### Payments (Polar)
- `POLAR_ACCESS_TOKEN` - **Must be from sandbox.polar.sh** (code uses `server: "sandbox"`)
- `POLAR_WEBHOOK_SECRET` - From sandbox.polar.sh webhook

### AWS (S3 + Polly)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` - `us-east-1`
- `AWS_S3_BUCKET_NAME` - `doppel-talk`

### Modal Backend
- `MODAL_API_URL` - `https://chris-9774--doppel-talk-texttospeechserver-generate-speech.modal.run`
- `MODAL_API_KEY` - Modal token ID (starts with `ak-`)
- `MODAL_API_SECRET` - Modal token secret (starts with `as-`)

---

## Domain Configuration

**Production domain:** `doppel.talk` (configured and working)

DNS managed at Spaceship. Vercel handles SSL automatically.

---

## GitHub Auto-Deploy

**Status:** CONFIGURED ✓

- **Repository:** https://github.com/chrisberno/doppel-talk
- **Branch:** `main`
- **Trigger:** Push to main → Production build

---

## Modal Backend Details

| Field | Value |
|-------|-------|
| Workspace | `chris-9774` |
| App Name | `doppel-talk` |
| Class | `TextToSpeechServer` |
| Method | `generate_speech` |
| GPU | L40S |
| Auth | `requires_proxy_auth=True` |

**Endpoint URL:** `https://chris-9774--doppel-talk-texttospeechserver-generate-speech.modal.run`

---

## Post-Deployment Verification

After deployment, verify:

1. [x] Site loads at https://doppel.talk
2. [x] Sign up flow works
3. [x] Sign in/out works
4. [ ] TTS generation works (UI not built yet)
5. [ ] Credit purchase works (not tested yet)

---

## Troubleshooting

### Polar "invalid_token" error
**Cause:** Token created at polar.sh (production) but code uses `server: "sandbox"`
**Fix:** Create token at https://sandbox.polar.sh

### Modal endpoint 404
**Cause:** Class name typo or mismatch
**Fix:** Check class name in tts.py matches URL, redeploy Modal, update `MODAL_API_URL`

### Vercel SSO blocking access
**Fix:** Disable SSO protection via Vercel dashboard or API

### Wrong Vercel account
**Fix:** `vercel logout && vercel login`, ensure correct browser/account

### "EPIPE" or upload failures
**Fix:** Network issue, retry the deployment command

---

## Agent Acknowledgment

**REQUIRED:** Before deploying, agents must confirm:

1. "I have verified the Vercel account with `vercel whoami`"
2. "I have confirmed the target account is `chrisberno-dev`"
3. "I understand Polar uses sandbox environment"
4. "I have read the devlog at `/Notes/DevLogs/250106-Initial-Setup-Deploy.md`"

---

## Related Documentation

- [Open Issues](./OPEN-ISSUES.md)
- [Initial Devlog](./DevLogs/250106-Initial-Setup-Deploy.md)

---

*Last updated: 2026-01-07*
*Created by: CTO Agent*
