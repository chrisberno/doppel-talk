# Doppel Center Enterprise Voice Tech Application v2.0

Enterprise voice technology platform combining AI-powered text-to-speech with Twilio integration and IVR export capabilities.

## Overview

Doppel Center is a production-ready platform that combines:
- **AI TTS Generation**: Multiple providers (Chatterbox AI, Twilio, Amazon Polly)
- **Enterprise IVR Tools**: TwiML, Studio JSON, and code snippet exports
- **Voice Library**: 16+ curated voices across multiple languages
- **Project Management**: Organize and manage your voice projects
- **Secure Authentication**: Better Auth integration
- **Payment Processing**: Polar credits system

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, Twilio Paste |
| **Backend** | Python 3.11 on Modal (serverless) |
| **Database** | Neon (PostgreSQL) + Prisma ORM |
| **Auth** | Better Auth |
| **Payments** | Polar |
| **Storage** | AWS S3 |

## Prerequisites

- Node.js 20.9+ (`node --version`)
- npm 11.0+
- PostgreSQL database (Neon recommended)
- AWS account (for S3 and Polly)
- Twilio account (optional, for Twilio provider)
- Modal account (for backend deployment)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database (Neon)
DATABASE_URL="postgresql://..."

# Auth (Better Auth)
BETTER_AUTH_SECRET="your-secret-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Payments (Polar)
POLAR_ACCESS_TOKEN="your-polar-token"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"

# AWS (S3 + Polly)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket"

# Modal Backend
MODAL_API_URL="your-modal-endpoint"
MODAL_API_KEY="your-modal-key"
MODAL_API_SECRET="your-modal-secret"
```

**Note:** Twilio credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`) are entered per-request in the UI and never stored.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up database:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Deploy backend to Modal:**
   ```bash
   cd backend/text-to-speech
   modal deploy tts.py
   ```

## Architecture

```
┌─────────────────┐
│   Next.js 16    │  Frontend (Vercel)
│   TypeScript    │
└────────┬────────┘
         │
         ├──► Modal API ──► Python TTS Service
         │                    ├── Chatterbox AI
         │                    ├── Twilio
         │                    └── Amazon Polly
         │
         ├──► Neon DB ──────► Prisma ORM
         │
         └──► AWS S3 ───────► Audio Storage
```

## Features

### Multi-Provider TTS
- **Chatterbox AI**: Default AI provider with natural voices
- **Twilio**: Enterprise-grade TTS via Twilio API
- **Amazon Polly**: Direct AWS Polly integration

### Voice Library
- 16+ curated voices
- Filter by provider, language, gender
- Audio samples for each voice
- Multi-language support (English, Spanish, French, Portuguese, etc.)

### IVR Exports
- **TwiML**: XML templates for Twilio webhooks
- **Studio JSON**: Twilio Studio Flow configurations
- **Code Snippets**: Node.js and Python examples

### Project Management
- Create and organize voice projects
- Audio history and playback
- Export tracking
- User authentication and credits

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format:write

# Database studio
npm run db:studio
```

## Deployment

### Vercel (Frontend)
1. Connect your GitHub repository
2. Add all environment variables
3. Deploy automatically on push

### Modal (Backend)
1. Install Modal CLI: `pip install modal`
2. Authenticate: `modal token new`
3. Deploy: `modal deploy backend/text-to-speech/tts.py`

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.
