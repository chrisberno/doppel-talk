# Branded & Corporate Content Suite

**Product:** doppel.talk
**Category:** Branded & Corporate Content
**Version:** 1.0 Draft
**Date:** 2026-01-14
**Author:** CTO

---

## Overview

### The Pattern

One voice creation engine. Three features. Same core, different wrappers.

| Feature | Intake | Voice Creation | Output |
|---------|--------|----------------|--------|
| Voice Broadcasting | "What do you want to say?" | TTS / Clone / AI Assist | Broadcast to people |
| IVR Builder | "What does your phone tree need?" | TTS / Clone / AI Assist | Publish to Twilio (JSON) |
| Voicemail Builder | "What messages do you need?" | TTS / Clone / AI Assist | Configure hold/VM experience |

### Distribution Channels

All three features share the same go-to-market:

| Channel | Access | End User | Twilio Ownership |
|---------|--------|----------|------------------|
| D2C (Retail) | doppel.talk UI | SMB, community orgs | doppel.talk's Twilio |
| B2B (Embedded) | iframe + postMessage | Connie Flex admins, enterprise | Client's Twilio (subaccount) |

### Shared Voice Creation Engine

All features use the same production workflow:

1. **Script** — Type, speak, or AI-assisted generation
2. **Voice** — Select talent, AI suggest, or clone
3. **Produce** — Generate audio via Chatterbox
4. **Review** — Preview, approve, commit to S3
5. **Publish** — Feature-specific output

---

## Feature 1: Voice Broadcasting

### One-Liner

Create AI-powered voice messages and broadcast them to any audience—directly or via embedded integration.

### Jobs to Be Done

**D2C User:**
> "When I need to notify my community about something urgent, I want to create a professional voice message and send it to everyone quickly, so that I don't have to call people one by one or rely on them reading emails."

**B2B Admin:**
> "When I need to broadcast an urgent update to contacts in our CRM, I want to create a voice message from within my admin tools and trigger a broadcast, so that our clients receive timely voice communication without manual effort."

**B2B Platform (Connie):**
> "When I want to offer voice broadcasting to my Flex clients, I want to embed a voice creation tool that handles the complexity, so that each client org can create and send broadcasts while billing stays isolated to their account."

### Workflow

#### Phase 1: SCRIPT
*"What do you want to say?"*

| Option | Description |
|--------|-------------|
| Type | Write the message manually |
| Speak | Record yourself speaking it |
| AI Assist | Describe intent → AI writes optimized script |

#### Phase 2: VOICE
*"How should it sound?"*

| Option | Description |
|--------|-------------|
| Select | Pick from voice talent library |
| AI Suggest | AI recommends voices based on message/tone |
| Clone | Use your own voice for personal touch |

#### Phase 3: PRODUCE
*"Generate the audio"*

- Script + Voice → Generated audio file
- Preview before committing

#### Phase 4: REVIEW & COMMIT
*"Approve it"*

- Full playback review
- Approve
- Commit to S3 (stable URL locked in)

#### Phase 5: DISTRIBUTE
*"Send it"*

**D2C (Retail):**
- Connect contacts (Google Contacts, Apple/iCloud)
- Fallback: Paste list or CSV upload
- Select recipients (all, individuals, by group/tag)
- Schedule or send immediately
- doppel.talk handles Twilio broadcast

**B2B (Embedded):**
- Admin creates message in doppel.talk iframe
- Audio URL + ID returned via postMessage
- Admin selects recipients in their CRM
- Client's backend triggers Twilio Voice API
- Status callbacks sent to doppel.talk webhook

#### Phase 6: LIBRARY & ANALYTICS
*"Your recordings live on"*

- Recordings saved to account
- Reuse for future broadcasts
- Delete when no longer needed
- Analytics: playback count, delivery stats, campaign history

### Technical Architecture (B2B)

```
Connie Flex (Parent Org)
├── Child Org A (subaccount)
├── Child Org B (subaccount)
└── Child Org C (subaccount)
        │
        ▼
Enhanced CRM Container
        │
        ├── doppel.talk (iframe embed)
        │   └── Create message → Commit to S3 → Return audio URL
        │
        ▼ postMessage
Connie Backend
        │
        ├── Pull contacts from CRM
        └── Call Twilio Voice API (child org credentials)
                │
                ▼
        Twilio Voice API
                │
                ▼ StatusCallback
        doppel.talk webhook
        └── Track delivery, generate reports
```

### Twilio Integration (Confirmed by Twilio Engineering)

1. **API Call Ownership:** Client's Flex/backend makes Twilio calls using child org credentials
2. **Credential Management:** Use subaccounts + API keys (not master Auth Token)
3. **Status Callbacks:** doppel.talk receives callbacks with org/broadcast metadata
4. **Embedding:** iframe with postMessage; validate origins; respect CSP headers
5. **Billing:** Isolated per child org via subaccount model

### v1 Scope

**In scope:**
- Text input for message creation
- Voice talent selection (existing library)
- Voice cloning (existing capability)
- S3 hosting with stable URLs
- D2C: Google Contacts + Apple/iCloud integration
- D2C: CSV/manual paste fallback
- D2C: Recipient selection (all, individual, group)
- D2C: Send now or schedule
- D2C: Confirmation + final delivery report
- B2B: iframe embed with postMessage API
- B2B: Return audio URL + ID
- B2B: Status callback webhook endpoint
- Library: save, reuse, delete recordings

**v2 / Future:**
- AI script assist
- AI voice suggestions
- Voice recording input (speak the message)
- Real-time broadcast progress UI
- Historical campaign analytics dashboard

### Templates (v1)

- Emergency Alert
- Appointment Reminder
- Event Announcement
- General Notification

---

## Feature 2: IVR Builder

### One-Liner

Design professional phone trees with guided intake, consistent AI voices, and one-click Twilio export—no Studio headaches.

### Jobs to Be Done

**B2B Admin:**
> "When I need to set up or update our phone system, I want to define the flow in plain English and generate professional prompts, so that I don't have to wrestle with Twilio Studio or hire a voice actor."

**Agency/Integrator:**
> "When I'm building IVR for clients, I want a tool that generates consistent, professional voice prompts and exports clean Twilio JSON, so that I can deliver faster and charge for the value, not the labor."

### The Problem

Twilio Studio sucks because:
- Complex UI for simple flows
- Non-intuitive for non-devs
- Hard to maintain/update prompts
- Voice consistency is manual work

### Workflow

#### Phase 1: DEFINE
*"What does your phone tree need?"*

Guided wizard captures requirements in plain English:

- "What's your main greeting?"
- "How many menu options?"
- "What happens at each branch?" (route to agent, voicemail, submenu)
- "Business hours? After-hours message?"
- "Hold music / hold messaging?"

**Output:** Flow structure + list of prompts needed

#### Phase 2: PRODUCE
*"Create your IVR personality"*

- Same voice creation engine: TTS / Clone / AI Assist
- One voice across ALL prompts (consistent IVR personality)
- AI assist for professional prompt wording
- Preview the full call flow (listen end-to-end)

#### Phase 3: PUBLISH
*"Send it to Twilio"*

- Commit all audio files to S3 (stable URLs)
- Export Twilio Studio JSON (ready to import)
- Update prompts anytime without touching Studio
- Analytics: prompt playback counts, drop-off points, paths taken

### v1 Scope

**In scope:**
- Guided intake wizard
- 2-3 pre-fab templates
- Prompt list generation from flow definition
- Voice creation for all prompts (TTS, clone)
- Consistent voice across flow
- Preview full call flow
- S3 hosting for all audio
- Twilio Studio JSON export
- Basic analytics (prompt playback)

**v2 / Future:**
- Visual flow editor
- Direct Twilio API push
- A/B testing prompts
- Advanced analytics (path analysis, drop-off funnels)
- AI script assist
- More templates

### Templates (v1)

- Simple Reception (greeting → menu → routes)
- Support Queue (greeting → hold → agent)
- Sales Router (greeting → qualification → transfer)

---

## Feature 3: Voicemail Builder

### One-Liner

Create professional voicemail greetings, hold messages, and callback experiences—consistent voice, zero hassle.

### Jobs to Be Done

**B2B Admin:**
> "When I need to update our hold message or voicemail greeting, I want to type what I want to say and generate it in our brand voice, so that I don't have to record it myself or wait for someone else to do it."

**Contact Center Manager:**
> "When I'm optimizing our callback experience, I want to easily test different hold messages and see which ones reduce abandonment, so that I can improve customer experience with data."

### The Problem

Current voicemail/hold messaging setup sucks:
- Recording quality is inconsistent
- Updating messages is painful
- No brand voice consistency
- Hold experiences are afterthoughts

### Context

Connie already has a live callback/wait experience. This feature addresses the **voice messaging layer** users hear:
- What they hear while waiting
- What they hear when leaving voicemail
- What they hear when offered callback

### Workflow

#### Phase 1: DEFINE
*"What messages do you need?"*

Guided intake for voicemail/hold experience:

- "Main voicemail greeting?"
- "After-hours message?"
- "Hold message / estimated wait?"
- "Callback offer script?"

**Output:** List of messages needed

#### Phase 2: PRODUCE
*"Create your voice experience"*

- Same voice creation engine: TTS / Clone / AI Assist
- One voice across ALL messages (brand consistency)
- AI assist for professional, empathetic wording
- Preview each message

#### Phase 3: PUBLISH
*"Deploy it"*

- Commit all audio to S3 (stable URLs)
- Export configuration for Twilio / Flex
- Update messages anytime
- Analytics: playback counts, callback conversion, hold time correlation

### v1 Scope

**In scope:**
- Guided intake for voicemail/hold messages
- 2-3 pre-fab templates
- Voice creation for all messages (TTS, clone)
- Consistent voice across experience
- S3 hosting
- Export URLs for Twilio/Flex configuration
- Basic analytics

**v2 / Future:**
- Dynamic hold messaging (estimated wait time injection)
- Mood-based voice adjustment
- Integration with queue analytics
- More templates

### Templates (v1)

- Professional Office (greeting, after-hours, voicemail)
- Support Queue (hold message, callback offer, voicemail)
- After Hours (closed message, emergency routing option)

---

## Shared Infrastructure

### S3 Audio Hosting

All features share the same storage pattern:

- Bucket: `doppel-talk`
- Public read access for playback
- Stable URLs: `https://doppel-talk.s3.us-east-1.amazonaws.com/{key}`
- Public slug endpoint: `GET /api/v/{slug}` (Twilio-compatible, 302 redirect)

### Analytics

| Metric | Voice Broadcasting | IVR Builder | Voicemail Builder |
|--------|-------------------|-------------|-------------------|
| Playback count | Per broadcast | Per prompt | Per message |
| Delivery stats | Delivered/Failed/VM | — | — |
| Path analysis | — | Which branches taken | — |
| Conversion | — | — | Callback acceptance |

### B2B Embed API

All features embed via iframe with postMessage:

**Embed URL Pattern:**
```
https://doppel.talk/embed/{feature}?org={orgId}&callback={callbackUrl}
```

**postMessage Protocol:**

```typescript
// doppel.talk → Parent (on commit)
{
  type: 'DOPPEL_AUDIO_READY',
  payload: {
    audioUrl: string,      // S3 URL
    audioId: string,       // Project ID
    slug: string,          // Public slug
    duration: number,      // Seconds
    metadata: {
      feature: 'broadcast' | 'ivr' | 'voicemail',
      name?: string,
      prompts?: string[],  // For IVR/VM: list of prompt IDs
    }
  }
}

// Parent → doppel.talk (optional: pre-fill)
{
  type: 'DOPPEL_INIT',
  payload: {
    orgId: string,
    template?: string,
    prefill?: {
      script?: string,
      voice?: string,
    }
  }
}
```

### Webhook Schema (Status Callbacks)

```typescript
// POST to doppel.talk webhook
{
  event: 'call.completed' | 'call.failed' | 'call.voicemail',
  orgId: string,
  broadcastId: string,
  callSid: string,
  to: string,
  status: string,
  duration: number,
  timestamp: string,
}
```

---

## Data Models

### New Tables Required

```prisma
model Broadcast {
  id            String   @id @default(cuid())
  userId        String
  orgId         String?  // For B2B
  audioProjectId String
  name          String?
  status        String   // draft, scheduled, sending, completed
  scheduledAt   DateTime?
  sentAt        DateTime?
  recipientCount Int     @default(0)
  deliveredCount Int     @default(0)
  failedCount   Int      @default(0)
  voicemailCount Int     @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])
  audioProject  AudioProject @relation(fields: [audioProjectId], references: [id])
  recipients    BroadcastRecipient[]
}

model BroadcastRecipient {
  id          String   @id @default(cuid())
  broadcastId String
  phone       String
  status      String   // pending, delivered, failed, voicemail
  callSid     String?
  duration    Int?
  completedAt DateTime?

  broadcast   Broadcast @relation(fields: [broadcastId], references: [id])
}

model IvrFlow {
  id          String   @id @default(cuid())
  userId      String
  orgId       String?
  name        String
  flowJson    Json     // The flow structure
  status      String   // draft, published
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
  prompts     IvrPrompt[]
}

model IvrPrompt {
  id            String   @id @default(cuid())
  ivrFlowId     String
  audioProjectId String
  nodeId        String   // Reference to flow node
  promptType    String   // greeting, menu, hold, transfer, etc.
  playCount     Int      @default(0)

  ivrFlow       IvrFlow  @relation(fields: [ivrFlowId], references: [id])
  audioProject  AudioProject @relation(fields: [audioProjectId], references: [id])
}

model VoicemailSet {
  id          String   @id @default(cuid())
  userId      String
  orgId       String?
  name        String
  status      String   // draft, published
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
  messages    VoicemailMessage[]
}

model VoicemailMessage {
  id              String   @id @default(cuid())
  voicemailSetId  String
  audioProjectId  String
  messageType     String   // greeting, afterhours, hold, callback
  playCount       Int      @default(0)

  voicemailSet    VoicemailSet @relation(fields: [voicemailSetId], references: [id])
  audioProject    AudioProject @relation(fields: [audioProjectId], references: [id])
}
```

---

## API Endpoints (New)

### Voice Broadcasting

```
POST /api/v1/broadcasts              # Create broadcast
GET  /api/v1/broadcasts              # List broadcasts
GET  /api/v1/broadcasts/:id          # Get broadcast details
POST /api/v1/broadcasts/:id/send     # Trigger send
POST /api/v1/broadcasts/:id/schedule # Schedule send
DELETE /api/v1/broadcasts/:id        # Delete broadcast

POST /api/v1/broadcasts/:id/recipients  # Add recipients
GET  /api/v1/broadcasts/:id/recipients  # List recipients
GET  /api/v1/broadcasts/:id/report      # Get delivery report

POST /api/webhooks/twilio/status     # Twilio status callback
```

### IVR Builder

```
POST /api/v1/ivr                     # Create IVR flow
GET  /api/v1/ivr                     # List IVR flows
GET  /api/v1/ivr/:id                 # Get IVR flow
PUT  /api/v1/ivr/:id                 # Update IVR flow
DELETE /api/v1/ivr/:id               # Delete IVR flow

POST /api/v1/ivr/:id/prompts         # Generate prompts
GET  /api/v1/ivr/:id/export          # Export Twilio Studio JSON
GET  /api/v1/ivr/:id/preview         # Get preview audio sequence
```

### Voicemail Builder

```
POST /api/v1/voicemail               # Create voicemail set
GET  /api/v1/voicemail               # List voicemail sets
GET  /api/v1/voicemail/:id           # Get voicemail set
PUT  /api/v1/voicemail/:id           # Update voicemail set
DELETE /api/v1/voicemail/:id         # Delete voicemail set

POST /api/v1/voicemail/:id/messages  # Generate messages
GET  /api/v1/voicemail/:id/export    # Export URLs/config
```

---

## Implementation Priority

### Phase 1: Voice Broadcasting (Weeks 1-2)
1. Broadcast data model + API
2. Recipient management (manual + CSV)
3. Twilio Voice API integration
4. Status callback webhook
5. Basic delivery report

### Phase 2: Contact Integrations (Week 3)
1. Google Contacts OAuth
2. Apple/iCloud integration
3. Contact sync + selection UI

### Phase 3: IVR Builder (Weeks 4-5)
1. Intake wizard UI
2. Flow data model
3. Prompt generation workflow
4. Twilio Studio JSON export

### Phase 4: Voicemail Builder (Week 6)
1. Message set data model
2. Intake wizard UI
3. Message generation workflow
4. URL export for Flex config

### Phase 5: B2B Embed (Week 7)
1. iframe embed mode
2. postMessage API
3. Org-scoped authentication
4. Webhook registration per org

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Broadcasts sent (v1 launch) | 100+ |
| B2B orgs using embed | 3+ |
| IVR flows created | 10+ |
| Voicemail sets created | 10+ |
| Time to create broadcast | < 5 min |
| Time to create IVR | < 15 min |

---

## References

- doppel.talk codebase: `/Users/cjberno/projects/chrisberno.dev/dev/doppel.talk`
- Twilio Voice Notification App: https://github.com/twilio/twilio-voice-notification-app
- ConnieML Broadcast SMS: https://github.com/ConnieML/broadcast-sms-messaging
- Twilio Studio JSON Schema: https://www.twilio.com/docs/studio/rest-api
- HeadVroom node: doppel.talk in Development graph (dev account)

---

*Spec maintained by CTO | doppel.talk*
