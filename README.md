# Feedback System

Anonymous student safety reporting app. Students submit reports (bullying, safety hazards, mental health concerns, abuse, academic dishonesty, policy complaints, or other) without an account; staff sign in to review, track, and resolve them.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Radix UI
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Better Auth (staff accounts only — reporters stay anonymous)

## Project Structure

```
app/
├── check-in/[caseId]/   # Anonymous case status check-in
├── confirmation/        # Post-submission confirmation screen
├── staff/
│   ├── dashboard/        # Staff report review dashboard
│   └── sign-in/          # Staff authentication
├── api/
│   ├── auth/             # Better Auth handlers
│   ├── check-in/[caseId]/# Case status lookup
│   ├── reports/          # Report submission & retrieval
│   └── staff/reports/    # Staff-only report management
└── page.tsx             # Public report submission form

db/
├── schema.ts            # Users, sessions, reports, categories, status
└── migrations/          # Drizzle migrations
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)

### Setup

```bash
npm install
```

Create a `.env.local` file:
```env
DATABASE_URL="your-postgres-connection-string"
BETTER_AUTH_SECRET="your-secret-key"
```

Run migrations:
```bash
npm run db:migrate
```

Start the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run db:generate` — generate Drizzle migrations
- `npm run db:migrate` — run migrations
- `npm run db:studio` — open Drizzle Studio

## Report Categories

Bullying/Harassment, Safety Hazard, Mental Health Concern, Abuse/Exploitation, Academic Dishonesty, Policy Complaint, Other. Reports in the abuse/exploitation and mental health categories are flagged as urgent.
