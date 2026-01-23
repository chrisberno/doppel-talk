# Fix: Voice File Upload 401 Error

**Date:** 2026-01-22
**Type:** Bug Fix
**Author:** SPOK + CEO

---

## Time Tracking

| Field | Value |
|-------|-------|
| Start | 8:25 PM |
| Stop | 9:55 PM |
| **Total** | **1h 30m** |

## Token Burn (Estimated)

| Category | Input | Output |
|----------|-------|--------|
| File reads (~8 files) | ~12,000 | - |
| Tool calls (~25 bash/edit) | ~3,000 | ~2,000 |
| Dialogue | ~4,000 | ~6,000 |
| System context | ~2,000 | - |
| **Total** | **~21,000** | **~8,000** |
| **Combined** | **~29,000 tokens** | |

*Note: Estimates based on session activity. For precise tracking, pull from API usage logs.*

---

## Issue

Voice clone upload at `/dashboard/create` failing with 401 error. User could not upload MP3 voice samples for Chatterbox AI voice cloning.

**Error in console:**
```
Upload error: Error: Failed to upload voice file
```

---

## Root Cause

**ALL AWS environment variables in Vercel had embedded newline characters** from copy/paste when originally configured.

Example of corrupted value:
```
AWS_REGION="us-east-1
"
```

The `\n` character was breaking the S3 client hostname construction, causing:
```
Region not accepted: region="us-east-1
" is not a valid hostname component.
```

**Secondary issue:** Generic error handling was masking the real error message.

---

## Fixes Applied

### 1. Improved Error Handling
**File:** `src/actions/voice-upload.tsx`

Changed catch block to surface actual error:
```tsx
// Before
return { success: false, error: "Failed to upload voice file" };

// After
const errorMessage = error instanceof Error ? error.message : "Failed to upload voice file";
return { success: false, error: errorMessage };
```

### 2. Fixed Auth Client Import
**File:** `src/lib/auth-client.ts`

Removed invalid server-side env import from client code:
```tsx
// Before
import { env } from "process";
export const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
  plugins: [polarClient()],
});

// After
export const authClient = createAuthClient({
  plugins: [polarClient()],
});
```

### 3. Cleaned All AWS Environment Variables
**Location:** Vercel Production Environment

Removed and re-added all 5 AWS env vars using `printf` to avoid newlines:

```bash
vercel env rm AWS_ACCESS_KEY_ID production -y
vercel env rm AWS_SECRET_ACCESS_KEY production -y
vercel env rm AWS_REGION production -y
vercel env rm AWS_S3_BUCKET_NAME production -y
vercel env rm AWS_S3_BUCKET_URL production -y

printf 'AKIAQKO6HBFUQJKVXRIW' | vercel env add AWS_ACCESS_KEY_ID production
printf 'us-east-1' | vercel env add AWS_REGION production
printf 'doppel-talk' | vercel env add AWS_S3_BUCKET_NAME production
printf 'https://doppel-talk.s3.us-east-1.amazonaws.com' | vercel env add AWS_S3_BUCKET_URL production
# (secret key also re-added)
```

---

## Verification

- Tested voice upload with `/Users/cjberno/Downloads/Voice Clone Script 1.mp3` (199KB)
- Upload successful
- Voice clone created and available in dropdown

---

## Commits

```
30802cc - fix: improve voice upload error handling and auth client config
```

---

## Lessons Learned

1. **Always use `printf` or `echo -n` when adding env vars via CLI** - heredocs and normal echo add newlines
2. **Surface real errors during development** - generic error messages hide root causes
3. **Use `od -c` to inspect env vars for hidden characters** when debugging weird failures

---

## Next Steps

- Build `/api/audio/[id]` endpoint to proxy S3 audio for Twilio Flex integration
- Test voice clone playback in Twilio Studio Flow

---

*Fix verified working in production at https://doppel.talk*
