# Implementation Plan: Team Kanban Board

**Branch**: `001-team-kanban-board` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-team-kanban-board/spec.md`

## Summary

Xây dựng ứng dụng Kanban board cho nhóm nhỏ: quản lý board/column/card, drag-and-drop, assign thành viên, comment, và activity log. Stack: Next.js 14 (App Router) full-stack với TypeScript, shadcn/ui + Tailwind CSS, @dnd-kit, Auth.js, PostgreSQL + Prisma.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js 14 (App Router), shadcn/ui + Radix UI, Tailwind CSS 3, @dnd-kit/core + @dnd-kit/sortable 6, Auth.js (NextAuth.js v5), TanStack Query 5, Zustand 4

**Storage**: Supabase PostgreSQL 15 + Prisma ORM 5 (Transaction Mode Pooler bắt buộc cho serverless)

**Testing**: Vitest + @testing-library/react (unit/integration), Playwright (E2E), @axe-core/react (a11y)

**Target Platform**: Web browser — responsive tại 375px, 768px, 1280px

**Project Type**: Full-stack web application (Next.js monorepo)

**Performance Goals**: LCP ≤ 2.5s (4G, Lighthouse ≥ 85), API p95 ≤ 300ms (warm requests), bundle ≤ 250KB gzipped (critical path)

**Constraints**: httpOnly cookie cho session token, CORS allowlist, rate limiting trên auth endpoints (Supabase table làm store), CSP headers, không cần WebSocket real-time; **Netlify**: function timeout 10s, 300 build min/tháng; **Supabase**: database pause sau 7 ngày inactivity (biết trước), 500MB storage; `DATABASE_URL` dùng pooler port 6543, `DIRECT_URL` dùng direct port 5432 cho migrations

**Scale/Scope**: Nhóm nhỏ < 50 người dùng, ~5 màn hình chính (Dashboard, Board, Card Detail, Activity Log, Auth)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Trạng thái | Ghi chú |
|---|---|---|
| I. Code Quality | ✅ PASS | TypeScript + ESLint + Prettier được enforce; shadcn/ui tránh custom styling một lần |
| II. Test-First | ✅ PASS | Vitest (unit/integration ≥ 80%) + Playwright (E2E theo acceptance scenarios) |
| III. UI/UX Consistency | ✅ PASS | shadcn/ui (approved library per Constitution), Tailwind design tokens, WCAG 2.1 AA qua Radix UI |
| IV. Security | ✅ PASS (có điều chỉnh) | Auth.js httpOnly cookie ✔; rate limiting trên Netlify serverless ⇒ dùng Supabase table đếm attempts thay cho in-memory |
| V. Performance | ✅ PASS | Next.js SSR đạt LCP ≤ 2.5s; code splitting built-in; Prisma tránh N+1; paginate activity log |

**Kết quả**: Không có vi phạm — tiến hành Phase 0.

## Project Structure

### Tài liệu (feature này)

```text
specs/001-team-kanban-board/
├── plan.md              # File này
├── research.md          # Phase 0: nghiên cứu công nghệ
├── data-model.md        # Phase 1: entity và quan hệ dữ liệu
├── quickstart.md        # Phase 1: hướng dẫn validate feature
├── contracts/           # Phase 1: API contracts (REST endpoints)
│   └── api.md
└── tasks.md             # Phase 2: danh sách tasks (do /speckit.tasks tạo)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: login, register
│   ├── (dashboard)/              # Route group: board list
│   ├── boards/[boardId]/         # Board view
│   │   └── page.tsx
│   └── api/                      # API Route Handlers
│       ├── auth/[...nextauth]/
│       ├── boards/
│       ├── columns/
│       ├── cards/
│       ├── comments/
│       └── activity/
├── components/
│   ├── ui/                       # shadcn/ui components (auto-generated)
│   ├── board/                    # Board-specific components
│   ├── card/                     # Card detail, card preview
│   └── activity/                 # Activity log components
├── lib/
│   ├── auth.ts                   # Auth.js config
│   ├── db.ts                     # Prisma client singleton
│   └── utils.ts                  # Shared utilities
├── hooks/                        # Custom React hooks
├── types/                        # Shared TypeScript types
└── prisma/
    ├── schema.prisma
    └── migrations/

netlify.toml                      # Netlify build config + @netlify/plugin-nextjs
.env.example                      # Mẫu biến môi trường (DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_URL)

tests/
├── unit/                         # Vitest unit tests
├── integration/                  # Vitest integration tests (API routes)
└── e2e/                          # Playwright E2E tests
```

**Quyết định cấu trúc**: Next.js monorepo duy nhất — không tách frontend/backend riêng vì dự án nhỏ, Next.js App Router xử lý cả UI lẫn API routes trong cùng codebase.
