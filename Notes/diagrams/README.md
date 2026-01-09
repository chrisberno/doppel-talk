# Architecture Diagrams

**Created:** 2026-01-07
**Tool:** [Eraser.io](https://eraser.io)

---

## Overview

This directory contains architecture diagrams for Doppel Talk. Visual diagrams help with:
- Onboarding new developers/agents
- Understanding project structure at a glance
- Planning architectural changes
- Documentation for stakeholders

---

## Files

| File | Description |
|------|-------------|
| `architecture-diagram.eraserdiagram` | Full project architecture including file structure, routes, database schema, and external services |

---

## How to View/Edit Diagrams

### Option 1: Eraser.io (Recommended)

1. Go to [eraser.io](https://eraser.io) and sign in
2. Create a new workspace or open an existing one
3. Click **"+ New"** → **"Diagram"**
4. In the diagram editor, click the **"<>"** code view button (usually top-right)
5. Copy the contents of the `.eraserdiagram` file and paste it
6. The diagram will render automatically

### Option 2: View as Text

The `.eraserdiagram` file is plain text using Eraser's DSL (Domain Specific Language). You can read it directly to understand the structure, even without rendering.

---

## Diagram Contents

### `architecture-diagram.eraserdiagram`

**Covers:**
- **Project Structure:** All directories and key files
- **App Router:** Pages and route groups ((dashboard), (auth), api)
- **Database Schema:** All Prisma models with fields and relationships
  - User, Session, Account, Verification
  - AudioProject (with multi-provider support)
  - UploadedVoice
- **External Services:** Vercel, Modal, Neon, S3, Polar.sh
- **Backend:** Modal TTS server structure

---

## Origin Story

The original "AI Voice Studio SaaS App" diagram was created by the original codebase author. During the doppel.talk v2.0 sprint (2026-01-07), we updated it to reflect:

- Added `backend/text-to-speech/` (Modal GPU backend)
- Added `Notes/` documentation structure
- Added `/dashboard/projects` route
- Updated Prisma schema with multi-provider fields
- Added external services visualization
- Reflects actual doppel.talk architecture vs generic template

---

## Future Development Ideas

### 1. Auto-Generate Diagrams from Code

Build a CLI tool or agent capability that:
- Scans project directory structure
- Parses `prisma/schema.prisma` for database models
- Reads `app/` directory for route structure
- Outputs Eraser-compatible diagram code automatically

**Benefits:**
- Always up-to-date diagrams
- No manual maintenance
- Could run as part of CI/CD

### 2. Diagram as Code in CI

- Store diagram source in repo (already doing this)
- Auto-render to PNG on commit
- Include in README or docs site

### 3. Interactive Architecture Explorer

Build a simple web UI that:
- Reads project structure
- Displays interactive tree view
- Generates Eraser/Mermaid/D2 diagram code
- One-click export to various formats

### 4. Multi-Format Support

Generate diagrams in multiple formats from single source:
- Eraser DSL
- Mermaid (GitHub-native rendering)
- D2 (newer, good CLI support)
- PlantUML (enterprise standard)

### 5. SPOK Integration

Add diagram generation as a SPOK agent capability:
- "CDO, generate architecture diagram for this project"
- Auto-creates and updates diagrams during documentation sprints

---

## Updating Diagrams

When making significant architectural changes:

1. Edit the `.eraserdiagram` file directly, or
2. Edit in Eraser.io and copy code back to file
3. Commit changes to git
4. Optionally export PNG for quick reference

---

## Related Documentation

- [DevLogs](../DevLogs/) - Sprint logs and technical decisions
- [OPEN-ISSUES.md](../OPEN-ISSUES.md) - Current blockers and TODOs
- [deploy-instructions.md](../deploy-instructions.md) - Deployment guide

---

*Diagrams are worth a thousand lines of documentation.*
