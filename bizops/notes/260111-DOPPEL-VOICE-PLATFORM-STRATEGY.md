# Doppel Voice Platform Strategy

**Author:** SPOK (Co-CEO)
**Date:** January 11, 2026
**Status:** Strategic Planning Document
**Last Updated:** January 11, 2026 @ 3:00 AM PST

---

## Executive Summary

Doppel is a unified voice platform powered by **Chatterbox** (open-source voice cloning). All voices - both "house voices" and user-uploaded clones - run through the same engine, giving every voice full emotion and pacing controls.

**Key Insight:** We don't need Polly/Twilio as runtime providers. We use Chatterbox for everything, with curated voice samples as the "off-the-shelf" options.

---

## Architecture Diagrams

Visual diagrams are available in `Notes/diagrams/`. Open in [Eraser.io](https://eraser.io) to render.

| Diagram | Description |
|---------|-------------|
| `v1-original-architecture.eraserdiagram` | **Before:** Fragmented - 3 backends (Replicate, Modal, Render) |
| `v2-unified-architecture.eraserdiagram` | **After:** Unified - Single Chatterbox backend on Modal |
| `architecture-diagram.eraserdiagram` | Code/file structure of doppel.talk project |

### V1 → V2 Summary

**V1 (Fragmented):**
- drift.clinic → VoiceCraft via Replicate ($0.15/clone)
- doppel.talk → Chatterbox on Modal + Polly fallback
- doppel.center → Express.js on Render → Polly only

**V2 (Unified):**
- ALL products → Chatterbox on Modal
- House voice library (curated samples with full controls)
- User uploads (custom clones with full controls)
- Retired: VoiceCraft, Replicate, doppel.center API, Polly runtime

---

## Part 1: The Product Layer Concept

### Philosophy

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCT LAYER                        │
│  (Focused UX solving specific market problems)          │
│                                                         │
│   drift.clinic     doppel.talk      [future products]   │
│   ───────────      ──────────       ────────────────    │
│   Sleep            Voice Studio     ???                 │
│   Affirmations     & TTS Tool                           │
│   in YOUR voice                                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    DOPPEL VOICE API                     │
│  (Unified backend - scales independently)               │
│                                                         │
│   • Chatterbox (ALL voice generation)                   │
│   • House voice library (curated samples)               │
│   • User voice uploads (custom clones)                  │
│   • Multi-language support (23 languages)               │
│   • Emotion/pacing controls (on ALL voices)             │
└─────────────────────────────────────────────────────────┘
```

### Why This Works

1. **Product teams stay focused** - drift.clinic only cares about sleep affirmations, not GPU infrastructure
2. **Backend scales independently** - Modal handles auto-scaling, cold starts, GPU allocation
3. **Shared R&D** - Improvements to voice quality benefit all products simultaneously
4. **Cost efficiency** - One infrastructure to maintain, not three
5. **Consistent capabilities** - Every voice (house or custom) has emotion/pacing controls

### Product Examples

| Product | Market Problem | Voice Feature Used |
|---------|---------------|-------------------|
| **drift.clinic** | Self-talk affirmations feel fake in someone else's voice | Clone user's voice → affirmations feel authentic |
| **doppel.talk** | Content creators need quick, quality voiceovers | House voices + custom cloning, all with emotion controls |
| **[Future]** | Podcasters want consistent AI co-hosts | Clone a persona, generate episodes |
| **[Future]** | IVR systems need accessible, adjustable voices | House voices with pace/diction controls for accessibility |

---

## Part 2: Voice Engine Architecture

### Single Engine, Two Voice Sources

**ALL voice generation runs through Chatterbox.** The difference is where the voice sample comes from:

#### Source 1: House Voice Library (Pre-loaded)

Curated voice samples stored in S3. Users pick from a dropdown.

- **9 voices currently loaded** (Matthew, Joanna, Ruth, Stephen, Amy, Brian, Emma, Ivy, Joey)
- **Full emotion/pacing controls** on every voice
- **No upload required** - instant access
- **Use case:** Quick generation, professional content, demos

```
User: "Generate with Matthew voice"
API: Loads samples/voices/polly-matthew-neural.mp3 → Chatterbox clones → Returns WAV
```

#### Source 2: User Voice Uploads (Custom)

Users upload their own voice sample. Chatterbox clones it.

- **10-15 second sample** is all that's needed
- **Full emotion/pacing controls** (same as house voices)
- **Personal/brand voices** - user owns the source
- **Use case:** Personalized content, brand voices, accessibility

```
User: Uploads voice sample + "Say this text"
API: Chatterbox analyzes sample → Generates cloned speech → Returns WAV
```

### Why NOT Polly/Twilio as Runtime Providers

We originally planned to offer Polly/Twilio as fallback options. **We're not doing that anymore.**

| Aspect | Polly/Twilio Direct | Chatterbox from Sample |
|--------|--------------------|-----------------------|
| Emotion control | No | Yes |
| Pacing control | Limited (SSML) | Yes - native slider |
| Voice consistency | Fixed | You control the source |
| Licensing | Gray area if cloning | Clean (own your samples) |
| Cost | Per-character API fees | Self-hosted GPU |

**Decision:** Use Polly-generated samples as *seed recordings* for house voices, then retire the runtime dependency. Eventually replace with royalty-free/open-source samples for cleaner licensing.

---

## Part 3: Tech Evolution - VoiceCraft to Chatterbox

### Why We Started with VoiceCraft

VoiceCraft (2024) was a breakthrough academic paper demonstrating:
- Zero-shot voice cloning from seconds of audio
- Speech editing (surgically changing words in recordings)
- State-of-the-art quality on "in-the-wild" audio

drift.clinic was prototyped using VoiceCraft via Replicate API (~$0.15/clone).

### Why We Moved to Chatterbox

Chatterbox (Resemble AI, 2025) is the **production-grade evolution**:

| Aspect | VoiceCraft | Chatterbox |
|--------|------------|------------|
| **Origin** | Academic research | Commercial open-source |
| **Speed** | Multi-step diffusion (slow) | Single-step Turbo model (fast) |
| **Emotion Control** | No | Yes - intensity slider |
| **Languages** | Limited | 23 out of the box |
| **Paralinguistics** | No | `[laugh]`, `[cough]`, `[sigh]` |
| **Watermarking** | No | Built-in (Perth) |
| **License** | Research/academic | MIT (fully commercial) |
| **Production-ready** | Needs work | Yes |
| **Maintenance** | Minimal updates | Active development |

### What We Lose

VoiceCraft's unique **speech editing** capability - changing specific words in existing audio while preserving voice. Chatterbox doesn't do this.

**Assessment:** None of our current products need speech editing. We generate fresh audio, we don't edit existing recordings. Acceptable tradeoff.

### Decision

**Standardize on Chatterbox.** Retire VoiceCraft dependency.

---

## Part 4: Current Stack & What Gets Retired

### Current State (After Tonight's Work)

```
┌─────────────────────────────────────────────────────────┐
│ doppel.talk ✅ WORKING                                  │
│ └── Chatterbox on Modal (self-hosted)                   │
│ └── 9 house voices loaded in S3                         │
│ └── User voice upload supported                         │
│ └── S3 public read access enabled                       │
├─────────────────────────────────────────────────────────┤
│ drift.clinic (needs migration)                          │
│ └── VoiceCraft via Replicate (paid API)                 │
├─────────────────────────────────────────────────────────┤
│ doppel.center (to be retired)                           │
│ └── Express.js on Render                                │
│ └── AWS Polly only                                      │
└─────────────────────────────────────────────────────────┘
```

### Target State (Clean)

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTS                             │
│                                                         │
│   drift.clinic          doppel.talk                     │
│   (Vercel)              (Vercel)                        │
│        │                     │                          │
│        └──────────┬──────────┘                          │
│                   ▼                                     │
│         ┌─────────────────┐                             │
│         │  DOPPEL VOICE   │                             │
│         │      API        │                             │
│         │    (Modal)      │                             │
│         │                 │                             │
│         │  • Chatterbox   │                             │
│         │  • House voices │                             │
│         │  • User uploads │                             │
│         └─────────────────┘                             │
│                   │                                     │
│                   ▼                                     │
│              AWS S3                                     │
│         (voice samples +                                │
│          generated audio)                               │
└─────────────────────────────────────────────────────────┘
```

### What Gets Retired

| Asset | Current Use | Action |
|-------|-------------|--------|
| **doppel.center API** | Polly wrapper on Render | **Retire** - redundant |
| **voice-demos.doppel.center** | Demo frontend | **Keep or migrate** - samples now in doppel.talk S3 |
| **VoiceCraft/Replicate** | drift.clinic voice | **Retire** - migrate to Chatterbox |
| **Polly/Twilio runtime** | doppel.talk fallback | **Retire** - not needed, Chatterbox handles all |

---

## Part 5: Migration Plan

### Phase 1: Stabilize doppel.talk ✅ COMPLETE

**Status:** Done (January 11, 2026)

- [x] Fix Modal proxy auth credentials
- [x] Redeploy Modal backend (URL typo fixed)
- [x] Verify Chatterbox endpoint works
- [x] Upload house voice samples to S3 (9 voices from doppel.center)
- [x] Update UI to use new voice samples
- [x] Enable S3 public read access for audio playback
- [x] Test end-to-end voice generation in browser
- [x] Verify playback and download work

**Outcome:** doppel.talk fully functional with voice cloning

### Phase 2: Expand House Voice Library

**Goal:** Build a proper voice library with clean licensing

Tasks:
- [ ] Source royalty-free voice samples (LibriVox, Common Voice, etc.)
- [ ] Curate 15-20 diverse voices (gender, accent, tone variety)
- [ ] Upload to S3 and update UI
- [ ] Remove Polly-sourced samples (licensing gray area)
- [ ] Add voice preview/audition feature

**Outcome:** Professional voice library with clean licensing

### Phase 3: Expose Unified API

**Goal:** Make the Modal endpoint a proper API that any product can call

Tasks:
- [ ] Document API endpoints and auth
- [ ] Add rate limiting / usage tracking
- [ ] Create API keys for different products
- [ ] Set up monitoring/alerting

**Outcome:** `api.doppel.talk` or similar - single voice API

### Phase 4: Migrate drift.clinic

**Goal:** Move drift.clinic from VoiceCraft/Replicate to Chatterbox/Modal

Tasks:
- [ ] Update drift.clinic to call Doppel Voice API
- [ ] Test voice cloning quality matches expectations
- [ ] Remove Replicate dependency
- [ ] Update cost projections (Modal vs Replicate)

**Outcome:** drift.clinic running on shared infrastructure

### Phase 5: Retire doppel.center

**Goal:** Shut down redundant infrastructure

Tasks:
- [ ] Verify no active users/integrations depend on doppel.center API
- [ ] Archive voice-demos frontend (samples already migrated)
- [ ] Shut down Render deployment
- [ ] Update DNS / retire domain or redirect

**Outcome:** One less thing to maintain

### Phase 6: Documentation & Handoff

**Goal:** Anyone can understand and extend the platform

Tasks:
- [ ] Architecture documentation
- [ ] API reference
- [ ] "How to add a new product" guide
- [ ] Cost analysis and projections

---

## Part 6: Technical Reference

### Modal Endpoint (Current)

```
URL: https://chris-9774--doppel-talk-texttospeechserver-generate-speech.modal.run

Auth Headers:
  Modal-Key: wk-LcwSYRjbqjW4x7KRLzWs4s
  Modal-Secret: ws-VfHpsxZgBgZWAXiGtP0Hrk

Provider: chatterbox (only provider needed now)
```

### Request Schema

```json
{
  "text": "Hello world",
  "provider": "chatterbox",
  "language": "en",
  "voice_s3_key": "samples/voices/polly-matthew-neural.mp3",
  "exaggeration": 0.5,
  "cfg_weight": 0.5
}
```

### Response Schema

```json
{
  "success": true,
  "s3_Key": "tts/uuid.wav",
  "audioUrl": "https://doppel-talk.s3.us-east-1.amazonaws.com/tts/uuid.wav",
  "provider": "chatterbox",
  "voiceId": null,
  "duration": 3.5,
  "error": null,
  "code": null
}
```

### S3 Bucket Structure

```
s3://doppel-talk/
├── samples/voices/           # House voice library (source samples)
│   ├── polly-matthew-neural.mp3
│   ├── polly-joanna-neural.mp3
│   ├── polly-ruth-generative.mp3
│   └── ... (16 total currently)
├── tts/                      # Generated audio output
│   └── {uuid}.wav
└── uploads/                  # User-uploaded voice samples
    └── {user-id}/{uuid}.wav
```

### Infrastructure

| Component | Service | Cost Model |
|-----------|---------|------------|
| Voice API | Modal | GPU-seconds (~$0.0003/sec on L40S) |
| Frontend (doppel.talk) | Vercel | Free tier / usage |
| Frontend (drift.clinic) | Vercel | Free tier / usage |
| Audio Storage | AWS S3 | ~$0.023/GB/month + public read |
| Database | Neon PostgreSQL | Free tier / usage |

### Key Files

```
doppel.talk/
├── backend/text-to-speech/tts.py           # Modal endpoint (Chatterbox)
├── src/app/(dashboard)/dashboard/create/   # Voice generation UI
│   └── page.tsx                            # VOICE_FILES array lives here
├── src/actions/tts.ts                      # Frontend server action
├── src/actions/voice-upload.tsx            # User voice upload handling
├── src/lib/voices.ts                       # Voice definitions (for Polly fallback - may remove)
└── .env                                    # Credentials

Credentials stored at:
~/.claude/credentials/MODAL-PROXY-AUTH.md
~/.claude/credentials/DOPPEL-TALK-TEST-USER.md (test account)
```

### Current House Voices (in UI)

| Name | S3 Key | Gender | Accent |
|------|--------|--------|--------|
| Matthew | polly-matthew-neural.mp3 | Male | American |
| Joanna | polly-joanna-neural.mp3 | Female | American |
| Ruth | polly-ruth-generative.mp3 | Female | American |
| Stephen | polly-stephen-generative.mp3 | Male | American |
| Amy | polly-amy-neural.mp3 | Female | British |
| Brian | polly-brian-neural.mp3 | Male | British |
| Emma | polly-emma-neural.mp3 | Female | British |
| Ivy | polly-ivy-neural.mp3 | Female | American |
| Joey | polly-joey-neural.mp3 | Male | American |

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| **Voice Cloning** | Creating a synthetic voice from a sample recording |
| **TTS (Text-to-Speech)** | Converting written text to spoken audio |
| **Chatterbox** | Open-source voice cloning model by Resemble AI (MIT license) |
| **VoiceCraft** | Academic voice cloning model (predecessor tech, being retired) |
| **House Voice** | Pre-loaded voice sample in our library (not user-uploaded) |
| **Modal** | Serverless GPU platform for ML workloads |
| **Zero-shot** | No training required - works from a single sample |
| **Exaggeration** | Chatterbox parameter controlling emotional intensity |
| **CFG Weight** | Chatterbox parameter controlling generation accuracy vs creativity |

---

## Session Log

### January 11, 2026 (Tonight)

**What we did:**
1. Fixed Modal proxy auth (wrong credential format: `ak-`/`as-` → `wk-`/`ws-`)
2. Redeployed Modal backend (URL had typo: `texttospeach` → `texttospeech`)
3. Uploaded 16 voice samples from doppel.center to doppel.talk S3
4. Updated UI to use new voice samples (replaced hardcoded "Michael")
5. Enabled S3 public read policy for audio playback
6. Tested end-to-end: generation, playback, and download all working

**Key decisions:**
- Retire Polly/Twilio as runtime providers - Chatterbox handles everything
- Use voice samples + Chatterbox for all voices (house and custom)
- This gives emotion/pacing control on ALL voices, not just clones
- Plan to replace Polly-sourced samples with royalty-free alternatives

**What's working:**
- doppel.talk voice generation: ✅
- House voice library: ✅ (9 voices in dropdown)
- Audio playback: ✅
- Audio download: ✅
- User voice upload: ✅ (UI exists, needs testing)

---

*Document generated by SPOK. Review and update as architecture evolves.*
