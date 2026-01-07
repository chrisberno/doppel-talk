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

### 2. Verify Project Linking

Check if the project is linked to the correct Vercel project:

```bash
vercel ls
```

Look for `doppel.talk` or `doppel-talk` in the list. If not present or linked to wrong project:

```bash
rm -rf .vercel
vercel link
```

Follow prompts to link to the correct project/team.

---

## Environment Variables

The following environment variables MUST be configured in Vercel before production deployment:

### Database (Neon)
- `DATABASE_URL` - Neon PostgreSQL connection string

### Auth (Better Auth)
- `BETTER_AUTH_SECRET` - Secure random string (32+ chars)
- `BETTER_AUTH_URL` - Production URL (e.g., `https://doppel.talk`)

### Payments (Polar) - Optional for MVP
- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`

### AWS (S3 + Polly)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default: `us-east-1`)
- `AWS_S3_BUCKET_NAME` (e.g., `doppel-talk`)
- `AWS_S3_BUCKET_URL` (e.g., `https://doppel-talk.s3.us-east-1.amazonaws.com`)

### Modal Backend
- `MODAL_API_URL` - Full endpoint URL (format: `https://{workspace}--{app}-{class}-{method}.modal.run`)
- `MODAL_API_KEY` - Modal token ID (starts with `ak-`)
- `MODAL_API_SECRET` - Modal token secret (starts with `as-`)
- `MODAL_APP_NAME` - App name (e.g., `doppel-talk`)

---

## Deployment Commands

### Preview Deployment (Staging)
```bash
vercel
```

### Production Deployment
```bash
vercel --prod
```

### With Auto-Confirm (use with caution)
```bash
vercel --prod --yes
```

---

## Domain Configuration

Production domain: `doppel.talk`

To configure custom domain in Vercel:
1. Go to Project Settings > Domains
2. Add `doppel.talk`
3. Configure DNS records as instructed by Vercel

---

## Post-Deployment Verification

After deployment, verify:

1. [ ] Site loads at production URL
2. [ ] Authentication flow works (sign up, sign in)
3. [ ] Database connection is active
4. [ ] S3 uploads work
5. [ ] Modal TTS endpoint responds

---

## Modal Backend Details

**Workspace:** `chris-9774`
**App Name:** `doppel-talk`
**Endpoint URL Pattern:** `https://chris-9774--doppel-talk-texttospeachserver-generate-speech.modal.run`

Note: The endpoint uses `requires_proxy_auth=True`, so requests must include Modal authentication headers.

---

## Troubleshooting

### "EPIPE" or upload failures
- Network issue. Retry the deployment command.

### Wrong project linked
- Delete `.vercel` folder and re-link with `vercel link`

### Environment variables not loading
- Check Vercel dashboard > Project Settings > Environment Variables
- Ensure variables are set for "Production" environment

---

## Agent Acknowledgment

**REQUIRED:** Before deploying, agents must confirm:

1. "I have verified the Vercel account with `vercel whoami`"
2. "I have confirmed the target account with the user"
3. "I have reviewed all environment variables are configured"

---

*Last updated: 2026-01-06*
*Created by: CTO Agent*
