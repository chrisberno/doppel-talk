# Doppel.talk Backlog

**Last Updated:** 2026-01-24
**Source:** Consolidated from `thewire-backlog.md` + S5b session refinements

---

## Product Vision

**Core Model:**
```
Voice Asset + Script Asset = Project (Generated Audio)
```

**Information Architecture:**
```
Voice Library
  ├── Doppel Clones (user's voice samples)
  └── Professional Agents (pre-made library voices)

Script Book
  ├── Production (approved scripts)
  ├── Drafts (work in progress)
  └── Archived

Projects
  └── Assembled outputs ready for distribution
```

**Distribution Rule:**
Only approved Projects go to BeaverDAM. Voices and Scripts are private inputs. Drafts stay in Doppel until approved.

---

## Completed

| Item | Sprint | Date |
|------|--------|------|
| Ship The Wire (CREATE + CONSUME) | S4 | 2026-01-23 |
| `register_asset` MCP tool | S5c | 2026-01-23 |
| `log_access` MCP tool | S5c | 2026-01-23 |
| Voice Recorder component | S5b | 2026-01-23 |
| Voice Recorder test page | S5b | 2026-01-23 |
| Custom naming for voice samples | S5b | 2026-01-23 |
| Nav restructure (Create → Doppel Voice Clones) | S5b | 2026-01-23 |
| Script Model (Prisma schema) | S5b | 2026-01-24 |
| Script Library Page (`/dashboard/scripts`) | S5b | 2026-01-24 |
| Script CRUD (create, edit, delete) | S5b | 2026-01-24 |
| Script States (Draft/Production/Archived) | S5b | 2026-01-24 |
| Script Metadata (name, type, department) | S5b | 2026-01-24 |
| Script Book nav item | S5b | 2026-01-24 |

---

## Active Work: Voice & Script Library System

### Voice Library

| Task | Description | Status |
|------|-------------|--------|
| In-Browser Recording | Record voice samples in browser | ✅ Done (isolated page) |
| Custom Voice Naming | User-defined names for samples | ✅ Done |
| Voice Library Page | `/dashboard/voices` - manage all voice samples | Pending |
| Professional Agents | Pre-made voice library (curated) | Pending |
| Integrate into Create flow | Select voice from library in generation | Pending |

### Script Book

| Task | Description | Status |
|------|-------------|--------|
| Script Model | Database model for reusable scripts | ✅ Done |
| Script Library Page | `/dashboard/scripts` - manage scripts | ✅ Done |
| Script CRUD | Create, edit, delete scripts | ✅ Done |
| Script States | Draft → Production → Archived | ✅ Done |
| Script Metadata | Name, type, department, tags | ✅ Done |
| Canned Scripts | Pre-made script templates | Pending |
| AI Script Generation | Generate scripts with AI | Future |
| Integrate into Create flow | Select script from library in generation | Pending |

### Projects (Assembly)

| Task | Description | Status |
|------|-------------|--------|
| Project Assembly Flow | Voice + Script → Generate → QA → Approve | Pending |
| Project States | Draft → Approved → Distributed | Pending |
| Asset Activation | "Approve for Distribution" → BeaverDAM | Pending |
| Projects Dashboard | View/manage all projects | Exists (needs update) |

### Navigation

| Task | Description | Status |
|------|-------------|--------|
| Voice Library nav | Voices section with Clones + Agents | Pending |
| Script Book nav | Scripts section with states | ✅ Done |
| Projects nav | Projects/outputs section | Exists |

---

## Infrastructure (S5d - Lower Priority)

| Task | Description | Status |
|------|-------------|--------|
| Own S3 Bucket | Separate from Connie's AWS | Pending |
| Tier Logic | Free vs Bronze enforcement | Pending |

---

## Tech Debt

| Item | Priority | Notes |
|------|----------|-------|
| Hydration mismatch in UserButton | LOW | Radix UI ID mismatch in `@daveyplate/better-auth-ui`. Cosmetic, doesn't affect functionality. |

---

## Security

| Item | Priority | Notes |
|------|----------|-------|
| Rotate Neon DB password | HIGH | GitGuardian alert 2026-01-23 |

---

## Backlog (Future)

| Item | Category | Notes |
|------|----------|-------|
| Share Draft for Review | Collaboration | Share preview link without full BeaverDAM distribution |
| `upload_asset` MCP tool | BeaverDAM | Direct file upload via MCP (deferred) |
| White-label API docs | Developer Experience | Enable partners to embed Doppel |
| Webhook on generation complete | API | Notify consumers when audio ready |
| Batch generation | API | Generate multiple outputs in one call |
| Voice preview before clone | UX | Let users hear sample quality |

---

## Architecture Reference

```
DOPPEL (Create)                    BEAVERDAM (Distribute)
─────────────────                  ────────────────────────
Voice Library (private)            Approved Projects only
Script Book (private)              Access control
Draft Projects (private)           Usage logging
                    ──approve──►   Distribution rules
```

**What goes where:**
| Asset Type | Doppel | BeaverDAM |
|------------|--------|-----------|
| Voice Samples | ✅ | ❌ |
| Scripts | ✅ | ❌ |
| Draft Projects | ✅ | ❌ |
| Approved Projects | ✅ | ✅ |

---

*"Voice + Script = Project. Only approved projects leave the factory."*
