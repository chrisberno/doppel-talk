# Doppel Talk v2.0 - Initial Setup & Deployment

**Date:** 2026-01-06 → 2026-01-07
**Sprint:** v2.0 Initial Build (Mega Sprint)
**Author:** CTO Agent + Claude Code
**Status:** Complete

---

## Executive Summary

Successfully deployed Doppel Talk v2.0 to production at **https://doppel.talk**. This devlog documents the complete setup process, issues encountered, solutions applied, and lessons learned for future agent reference.

---

## Initial Prompt Response

This devlog responds to the initial project prompt (`doppel-center-v2-prompt-final.md.pdf`) which outlined the vision for an enterprise A.I. voice solutions platform. The implementation achieved:

- Multi-provider TTS architecture (Chatterbox AI, Twilio/Polly, Amazon Polly)
- Credit-based payment system via Polar.sh
- Modern auth via Better Auth
- Serverless GPU backend via Modal
- Production deployment with auto-deploy from GitHub

---

## Third-Party Services Configured

### 1. Vercel (Frontend Hosting)
- **Account:** `chrisberno-dev` (chris@chrisberno.dev)
- **Project:** `doppel.talk`
- **Domain:** https://doppel.talk
- **Auto-Deploy:** Enabled (push to `main` triggers production build)
- **Environment:** Production

**Critical Lesson:** Always verify Vercel account with `vercel whoami` before deployment. During this sprint, we nearly deployed to the wrong account (`headvroom-6823`).

### 2. Modal (GPU Backend)
- **Workspace:** `chris-9774`
- **App Name:** `doppel-talk`
- **GPU:** L40S
- **Endpoint:** `https://chris-9774--doppel-talk-texttospeechserver-generate-speech.modal.run`
- **Auth:** Proxy auth enabled (`requires_proxy_auth=True`)

**Critical Fix:** Original code had typos:
- `TextToSpeachServer` → `TextToSpeechServer`
- `huppingface` → `huggingface`

These typos affected the endpoint URL. After fixing, Modal needed redeployment AND Vercel env var `MODAL_API_URL` needed updating.

### 3. Neon (PostgreSQL Database)
- **Provider:** Neon.tech
- **Connection:** Via `DATABASE_URL` environment variable
- **ORM:** Prisma 6.6.0

### 4. AWS S3 (File Storage)
- **Bucket:** `doppel-talk`
- **Region:** `us-east-1`
- **Use:** Voice samples, generated audio storage
- **Mount:** CloudBucketMount in Modal container

### 5. Polar.sh (Payments)
- **Environment:** Sandbox (NOT production)
- **Dashboard:** https://sandbox.polar.sh
- **Integration:** Better Auth plugin

**Critical Lesson:** The code uses `server: "sandbox"` in `src/lib/auth.ts`. If you create tokens at https://polar.sh (production), they won't work. Must use https://sandbox.polar.sh for sandbox tokens.

**Products Configured:**
| Slug | Product ID | Credits |
|------|-----------|---------|
| small | c0590765-eac9-4c0b-99d2-fc8f98920eba | 50 |
| medium | 78276150-2dd9-437b-8fe9-8671df481b66 | 200 |
| large | 0f81ee54-c80a-4907-9592-073b0b606af4 | 400 |

### 6. GitHub (Source Control)
- **Repository:** https://github.com/chrisberno/doppel-talk
- **Branch:** `main` (renamed from `v2`)
- **Auto-Deploy:** Connected to Vercel

---

## Environment Variables (Vercel Production)

| Variable | Purpose | Notes |
|----------|---------|-------|
| `DATABASE_URL` | Neon PostgreSQL | Connection string |
| `BETTER_AUTH_SECRET` | Auth signing | 32+ char random string |
| `BETTER_AUTH_URL` | Auth callback URL | `https://doppel.talk` |
| `POLAR_ACCESS_TOKEN` | Polar API | **Must be sandbox token** |
| `POLAR_WEBHOOK_SECRET` | Webhook verification | From sandbox.polar.sh |
| `AWS_ACCESS_KEY_ID` | S3/Polly access | |
| `AWS_SECRET_ACCESS_KEY` | S3/Polly secret | |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | Bucket name | `doppel-talk` |
| `MODAL_API_URL` | TTS endpoint | Full URL with corrected class name |
| `MODAL_API_KEY` | Modal token ID | Starts with `ak-` |
| `MODAL_API_SECRET` | Modal token secret | Starts with `as-` |

---

## Features Tested

### Authentication Flow
- [x] Sign up with email/password - **WORKING**
- [x] Sign out - **WORKING**
- [x] Sign back in - **WORKING**
- [ ] Password reset - Not tested
- [ ] Social auth - Not configured

### Payment Flow
- [x] Polar sandbox integration - **CONFIGURED**
- [ ] Credit purchase - Not tested (sandbox ready)
- [ ] Webhook receipt - Not tested

### TTS Generation
- [ ] Chatterbox AI generation - Not tested via UI
- [ ] Twilio provider - Not tested
- [ ] Polly provider - Not tested
- [x] Modal endpoint deployed - **WORKING**

---

## Issues Encountered & Solutions

### Issue 1: Next.js Security Vulnerability
**Error:** Vercel blocked deployment due to CVE-2025-66478
**Solution:** `npm install next@latest` (16.0.1 → 16.1.1)

### Issue 2: Missing Polar Environment Variables
**Error:** Build failed - `Invalid environment variables: POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET`
**Solution:** Added placeholder values initially, then real sandbox credentials

### Issue 3: Vercel SSO Protection Blocking Public Access
**Symptom:** Site returning 401 with SSO nonce cookie
**Solution:** Disabled via API:
```bash
curl -X PATCH "https://api.vercel.com/v9/projects/PROJECT_ID" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection":null}'
```

### Issue 4: Wrong Vercel Account
**Symptom:** Logged into `headvroom-6823` instead of `chrisberno-dev`
**Solution:**
1. Log out of Vercel in browser
2. Switch accounts
3. `vercel logout && vercel login` in CLI

**Lesson:** Safari was default browser, opened wrong account. Changed default to Chrome.

### Issue 5: Polar Invalid Token Error
**Error:** `Status 401 Body: {"error": "invalid_token"}`
**Cause:** Created production token but code uses `server: "sandbox"`
**Solution:** Created new token at https://sandbox.polar.sh

### Issue 6: Modal Class Typos
**Typos:**
- Line 66: `huppingface` → `huggingface`
- Line 72: `TextToSpeachServer` → `TextToSpeechServer`

**Impact:** Changed endpoint URL from `texttospeachserver` to `texttospeechserver`
**Solution:**
1. Fix typos in `backend/text-to-speech/tts.py`
2. Redeploy Modal: `modal deploy tts.py`
3. Update `MODAL_API_URL` in Vercel

---

## Architecture Notes

### TTS Multi-Provider Design
The backend supports three TTS providers with credential pass-through:

1. **Chatterbox AI** (default) - Custom voice cloning, runs on Modal GPU
2. **Twilio** - Uses Polly under the hood, validates Twilio creds first
3. **Polly** - Direct AWS Polly integration

Credentials are passed per-request and never stored. This allows enterprise customers to use their own AWS/Twilio accounts.

### Modal Lazy Loading
The Chatterbox model is loaded lazily (`_load_chatterbox_model()`) to avoid GPU memory usage when only using Twilio/Polly providers.

### Import Pattern for Modal
Heavy imports (torch, torchaudio) are done inside the Modal container, not at module level. This allows `modal deploy` to work without torch installed locally.

---

## Deployment Workflow

### Standard Deploy (Recommended)
```bash
git add .
git commit -m "your message"
git push origin main
# Auto-deploys to production via Vercel GitHub integration
```

### Manual Deploy (Emergency Only)
```bash
vercel whoami  # VERIFY ACCOUNT FIRST
vercel --prod
```

### Modal Backend Deploy
```bash
cd backend/text-to-speech
modal deploy tts.py
```

---

## Project Structure

```
doppel.talk/
├── src/
│   ├── app/
│   │   ├── api/auth/[...all]/route.ts  # Better Auth handler
│   │   └── ...
│   └── lib/
│       └── auth.ts                      # Auth + Polar config
├── backend/
│   └── text-to-speech/
│       ├── tts.py                       # Modal TTS server
│       └── requirements.txt
├── Notes/
│   ├── DevLogs/                         # This directory
│   ├── OPEN-ISSUES.md
│   └── deploy-instructions.md
└── prisma/
    └── schema.prisma
```

---

## Lessons for Future Agents

1. **Always verify Vercel account** before any deployment action
2. **Sandbox vs Production** - Check `server:` setting in auth.ts before creating Polar tokens
3. **Typos matter** - Class names affect Modal endpoint URLs
4. **Read deploy-instructions.md** - It exists for a reason
5. **Browser matters** - Default browser affects OAuth flows
6. **Check existing docs** - OPEN-ISSUES.md tracks known blockers

---

## Next Steps

1. Build TTS generation UI
2. Test credit purchase flow with sandbox
3. Test full TTS generation end-to-end
4. Consider doppel.center migration to Vercel
5. Switch to Polar production when ready to launch

---

## Related Documentation

- [Deploy Instructions](../deploy-instructions.md)
- [Open Issues](../OPEN-ISSUES.md)
- [Initial Prompt](./doppel-center-v2-prompt-final.md.pdf)

---

*This devlog serves as institutional memory for the Doppel Talk project. Future agents should read this before making changes.*
