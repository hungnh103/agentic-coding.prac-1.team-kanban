# Team Kanban Board

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Team Kanban Board is a full-stack web application designed to help small teams manage work visually and efficiently through a Kanban workflow. The platform supports board creation, task organization, drag-and-drop movement between stages, task assignment, comments, and activity tracking in a collaborative environment.

## Overview

This project was built to reflect a realistic team workflow: planning work, breaking it into actionable tasks, tracking progress, and keeping delivery transparent across the team. It is suitable for short sprints, internal project coordination, daily task management, and lightweight agile collaboration.

## Live Demo

**Demo URL**: [Team Kanban Board on Netlify](https://team-kanban-zz.netlify.app)

To experience the application locally, follow the [Getting Started](#getting-started) section below.

## Why This Project Matters

This project is more than a basic Kanban demo. It demonstrates a production-oriented approach to building a collaborative product with:

- clear user flows for team-based task management
- a structured data model for boards, columns, cards, comments, and activity logs
- modern frontend and backend architecture
- authentication, authorization, and database-driven workflows
- testing practices for reliability and maintainability

## Key Features

- User authentication and authorization with Auth.js
- Creation and management of multiple boards for different teams or projects
- Create, rename, and delete workflow columns
- Create, edit, delete, and move cards across columns
- Assign work to team members using assignees
- Add comments to cards and review activity history
- Responsive interface for desktop and mobile experiences
- Unit, integration, and end-to-end testing with Vitest and Playwright

## Tech Stack

- Frontend: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- State & data fetching: Zustand, TanStack Query
- Drag & drop: @dnd-kit
- Backend/API: Next.js App Router API routes
- Database & ORM: PostgreSQL + Prisma
- Authentication: NextAuth.js / Auth.js
- Testing: Vitest, Testing Library, Playwright

## Architecture Overview

The application follows a full-stack monorepo structure powered by Next.js App Router. The frontend renders the board experience, while API routes handle business logic, authentication-aware operations, and database interactions. Prisma connects the application to PostgreSQL to persist boards, columns, cards, comments, and activity logs.

## Architecture Diagram

```text
User Browser
   │
   ▼
Next.js App Router
   ├─ Page Components
   ├─ API Routes
   └─ Server Actions / Auth Layer
           │
           ▼
      Prisma ORM
           │
           ▼
   PostgreSQL Database
           │
           ├─ users
           ├─ boards
           ├─ board_members
           ├─ columns
           ├─ cards
           ├─ comments
           └─ activity_logs
```

## Project Structure

```text
src/
  app/              # Next.js routes and API handlers
  components/       # domain-based UI components (board, card, activity)
  hooks/            # reusable data and mutation hooks
  lib/              # authentication, database, and helper modules
  types/            # shared TypeScript types
prisma/             # Prisma schema and migrations
tests/              # unit, integration, and E2E tests
```

## System Requirements

- Node.js 20+
- npm or pnpm
- PostgreSQL database (recommended: Supabase)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create the environment file from the example:

```bash
cp .env.example .env.local
```

3. Configure the required environment variables in .env.local, especially:

- DATABASE_URL: PostgreSQL pooler connection used by the application
- DIRECT_URL: direct connection used by Prisma migrations
- AUTH_SECRET, AUTH_URL, NEXTAUTH_URL

4. Generate the Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Available Scripts

```bash
npm run dev              # start the development server
npm run build            # create a production build
npm run start            # run the production build
npm run lint             # run lint checks
npm run test             # run unit and integration tests
npm run test:e2e         # run end-to-end tests
npm run test:coverage    # run tests with coverage reporting
```

## Deployment

The project is structured to support deployment on Netlify with a PostgreSQL backend such as Supabase. Production deployment requires the correct environment variables and network access to the database.

## Challenges & Solutions

### 1. **Database Connection Pooling for Serverless**
**Challenge**: Direct PostgreSQL connections are not efficient in a serverless environment where connections are short-lived and functions scale horizontally.

**Solution**: Configured Prisma to use separate connection strings:
- `DATABASE_URL` with pooler mode (port 6543) for application queries
- `DIRECT_URL` with direct mode (port 5432) for migrations only

This prevents connection exhaustion and ensures reliable deployments on platforms like Netlify.

### 2. **State Management Across Drag-and-Drop Operations**
**Challenge**: Real-time synchronization of card positions, column orders, and board state during drag-and-drop while maintaining optimistic UI updates.

**Solution**: Implemented a two-layer approach:
- Client-side: Zustand for optimistic updates and local state
- Server-side: Prisma transactions with order fields (Float) for atomic position updates
- React Query for cache invalidation and background synchronization

### 3. **Authorization at Scale**
**Challenge**: Preventing unauthorized users from viewing, editing, or deleting boards and ensuring membership-based access control.

**Solution**: Built a consistent authorization middleware:
- Server-side session checks on all API routes
- Unique constraint on `(boardId, userId)` in BoardMember table
- Pre-validation of assignee membership before card updates
- Activity log with actor tracking for audit trails

### 4. **Testing Collaborative Features**
**Challenge**: Testing real-world scenarios like multiple users editing the same board, permissions, and activity tracking.

**Solution**: Created comprehensive test suites:
- Unit tests for business logic (card movement, comment creation)
- Integration tests for API routes with mocked auth
- E2E tests with Playwright simulating multiple user scenarios
- Activity log validation to ensure all actions are tracked

## Testing

Run the test suite with:

```bash
npm run test
npm run test:e2e
```

## Closing Note

This repository represents a practical, user-centered web application that combines collaboration, workflow clarity, and modern full-stack engineering in a single product experience.
