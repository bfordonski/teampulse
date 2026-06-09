# Consulting Platform

Internal consulting application for CV management, team composition, project proposals, client presentations, and AI-assisted content generation.

## Architecture

Monorepo with **Domain-Driven Design** bounded contexts:

| Context | Module path | Status |
|---------|-------------|--------|
| Candidate Management | `apps/api/src/modules/candidate` | Implemented |
| Team Composition | `apps/api/src/modules/team` | Implemented |
| Identity & Access | `apps/api/src/modules/user` | Planned |
| Project & Proposal | `apps/api/src/modules/project` | Planned |
| AI Content Generation | `apps/api/src/modules/ai` | Planned |

Each module follows:

```
domain/          # Aggregates, entities, value objects, domain services, repository ports
application/     # Use cases, DTOs, mappers (no framework logic)
infrastructure/  # HTTP controllers, Prisma adapters
```

Shared tactical building blocks live in `packages/shared-kernel`.

## Tech stack

- **API**: NestJS + TypeScript + Prisma + PostgreSQL
- **Web**: Next.js App Router + Tailwind (`apps/web`)
- **UI**: shadcn-style components, drag-and-drop team builder

## Quick start (Supabase — no Docker)

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → Database**, copy two connection strings (URI mode):
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`
   - **Session pooler** or **Direct** (port `5432`) → `DIRECT_URL`
3. Set your database password when prompted (save it — you need it in the URI).

```powershell
cd C:\Users\bfordonski\Projects\consulting-platform
copy apps\api\.env.example apps\api\.env
# Edit apps\api\.env and paste both Supabase URLs (replace [YOUR-PASSWORD] etc.)

npm install
npm run prisma:generate --workspace=@consulting/api
npm run prisma:migrate --workspace=@consulting/api
npm run prisma:seed --workspace=@consulting/api
npm run dev --workspace=@consulting/api
```

API base URL: `http://localhost:3001/api`

### Web UI

```powershell
copy apps\web\.env.local.example apps\web\.env.local
npm install
npm run dev --workspace=@consulting/web
```

Open `http://localhost:3000` — team builder at `/teams/new`, candidate list at `/candidates`.

Run the API (`npm run dev --workspace=@consulting/api`) in a second terminal.

### Local Postgres (optional)

If you install Docker Desktop later: `docker compose up -d` and use the URLs in `.env.example` comments for local dev instead of Supabase.

## Example API endpoints

### Candidates

- `POST /api/candidates` — create candidate
- `GET /api/candidates?skills=TypeScript,NestJS&minYearsExperience=5`
- `GET /api/candidates/:id`
- `PATCH /api/candidates/:id`

### Teams

- `POST /api/teams`
- `GET /api/teams`
- `POST /api/teams/:id/members`
- `PATCH /api/teams/:id/members/:candidateId/role`
- `DELETE /api/teams/:id/members/:candidateId`
- `POST /api/teams/:id/activate` — validates composition (Tech Lead required)

## Design highlights

1. **Aggregates enforce invariants** — e.g. `Team.addMember` delegates to `TeamCompositionDomainService` before persisting.
2. **Controllers are thin** — they delegate to application use cases only.
3. **Repository ports in domain** — Prisma implementations live in infrastructure.
4. **`reconstitute` factories** — persistence hydration avoids re-emitting domain events or re-running creation rules.

## Next steps

- `user`, `project`, `ai` modules
- Next.js UI with shadcn
- OpenAI/Azure adapter in `ai` bounded context
