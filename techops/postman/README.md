# Doppel Talk Postman Collection

API testing collection for Doppel Talk - the Voice Content Management System.

## Files

| File | Description |
|------|-------------|
| `doppel-talk.postman_collection.json` | Main API collection |
| `doppel-talk-production.postman_environment.json` | Production environment (doppel.talk) |
| `doppel-talk-local.postman_environment.json` | Local development environment |

## Quick Start

1. **Import Collection**: In Postman, click Import → select `doppel-talk.postman_collection.json`
2. **Import Environment**: Import the appropriate environment file (Production or Local)
3. **Select Environment**: Choose the environment from the dropdown in top-right
4. **Run Requests**: Start with "Get Voice by Slug" to test public API

## API Endpoints

### Public Voice API (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v/{slug}` | Get audio by public slug (Twilio-compatible) |
| `GET` | `/api/health` | Health check |

### Dashboard API (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Generate voice audio |
| `GET` | `/api/projects` | List user's projects |
| `POST` | `/api/projects/share` | Toggle public sharing |
| `PATCH` | `/api/projects/{id}` | Update project metadata |
| `DELETE` | `/api/projects/{id}` | Delete project |
| `GET` | `/api/usage` | Get usage statistics |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/export` | Export as TwiML, Studio JSON, Node.js, or Python |

## Twilio Integration

Once you have a public slug, use it in Twilio:

```xml
<Response>
  <Play>https://doppel.talk/api/v/your-slug-here</Play>
</Response>
```

Or in Twilio Studio, use the Play Audio widget with the URL.

## Rate Limits

- **Public API**: 10 requests/second per IP
- **Monthly Plays**: Based on tier (Free: 100, Pro: 10k, Business: 100k)
- **Public Assets**: Based on tier (Free: 3, Pro: 25, Business: unlimited)

## Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `302` | Redirect to audio file |
| `402` | Payment required (limit exceeded) |
| `404` | Not found |
| `429` | Rate limit exceeded |

## Variables

Set these in your environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000` |
| `slug` | Public slug to test | `my-greeting` |
| `project_id` | Project ID for dashboard API | `clxyz...` |

---

*Voice Content Management for the modern web.*
