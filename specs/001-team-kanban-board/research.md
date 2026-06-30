# Research: Team Kanban Board

**Branch**: `001-team-kanban-board` | **Phase**: 0 — Nghiên cứu công nghệ

---

## Câu hỏi nghiên cứu

1. Framework phù hợp nhất cho dự án web nhỏ có cả frontend và backend?
2. Thư viện drag-and-drop nào hỗ trợ tốt nhất cả desktop lẫn mobile/touch?
3. Giải pháp authentication nào phù hợp với yêu cầu httpOnly cookie của Constitution?
4. ORM nào phù hợp với PostgreSQL và TypeScript?
5. Component library nào phù hợp với Tailwind CSS và yêu cầu accessibility WCAG 2.1 AA?

---

## Quyết định 1: Framework tổng thể

**Quyết định**: **Next.js 14+ (App Router) — Full-stack monorepo**

**Lý do chọn**:
- Dự án nhỏ cho nhóm ít người → một codebase duy nhất, deployment đơn giản hơn
- Next.js App Router cung cấp cả Server Components và API Routes trong một package → tránh duy trì 2 server riêng biệt
- Built-in SSR giúp đạt LCP ≤ 2.5s (yêu cầu Constitution V) dễ dàng hơn SPA thuần
- TypeScript support first-class, tích hợp tốt với ESLint/Prettier (Constitution I)
- Hệ sinh thái lớn, tài liệu phong phú, cộng đồng active

**Các phương án đã xem xét**:
- React SPA + Express/Fastify backend riêng: phức tạp hơn (2 repo/deployment), không cần thiết ở quy mô nhỏ
- Remix: Tốt nhưng ít phổ biến hơn, hệ sinh thái nhỏ hơn Next.js
- Nuxt/SvelteKit: Thay đổi language (Vue/Svelte), không tối ưu khi team quen React/TypeScript

---

## Quyết định 2: Drag-and-drop

**Quyết định**: **@dnd-kit/core + @dnd-kit/sortable**

**Lý do chọn**:
- Hỗ trợ **touch natively** (yêu cầu User Story 3, Acceptance Scenario 4) — không cần patch thêm
- API hiện đại, dựa trên hooks, tương thích tốt với React 18 và Concurrent Mode
- Hỗ trợ **accessibility** (keyboard navigation, ARIA) — đáp ứng Constitution III
- Nhẹ hơn react-beautiful-dnd, đang được maintain tích cực (react-beautiful-dnd đã không còn được duy trì bởi Atlassian)
- Hỗ trợ cross-container drag (card sang column khác) và trong-container sort (reorder card trong cùng column)

**Các phương án đã xem xét**:
- react-beautiful-dnd: Không còn được maintain, không hỗ trợ touch tốt
- react-dnd: API phức tạp hơn, dựa trên HTML5 DnD API — kém trên mobile
- Pragmatic Drag and Drop (Atlassian): Mới, ít tài liệu, học curve cao

---

## Quyết định 3: Authentication

**Quyết định**: **Auth.js (NextAuth.js v5)**

**Lý do chọn**:
- Tích hợp native với Next.js, cấu hình tối thiểu
- Mặc định lưu session token trong **httpOnly cookie** — tuân thủ Constitution IV (Security)
- Hỗ trợ Credentials provider (email/password) phù hợp yêu cầu "đăng ký tài khoản" trong spec
- Có thể mở rộng thêm OAuth (Google, GitHub) trong tương lai không cần thay đổi kiến trúc
- Built-in CSRF protection và rate limiting hooks

**Các phương án đã xem xét**:
- JWT tự implement: Dễ sai sót bảo mật, không nên tự làm khi có giải pháp chuẩn
- Lucia Auth: Nhẹ hơn nhưng ít tài liệu hơn
- Clerk / Auth0: SaaS, chi phí khi scale, vendor lock-in không phù hợp dự án nhỏ tự host

---

## Quyết định 4: Database & ORM

**Quyết định**: **Supabase (PostgreSQL) + Prisma ORM** (cập nhật: target deployment là Supabase Free Tier)

**Lý do chọn**:
- PostgreSQL: Relational database phù hợp với dữ liệu có quan hệ rõ ràng (Board → Column → Card → Comment)
- **Supabase** cung cấp PostgreSQL managed + PgBouncer connection pooler built-in → không cần tự setup PostgreSQL server
- **Prisma**: Type-safe ORM, auto-generate TypeScript types từ schema → khớp với Constitution I (type annotations)
- Prisma schema trực quan, migration dễ quản lý
- N+1 problem dễ tránh với Prisma `include` và query optimization (Constitution V)

**Cấu hình Prisma bắt buộc cho Supabase + Serverless** (Netlify Functions):
- Mỗi serverless invocation có thể mở DB connection mới → dễ vượt giới hạn connection pool
- Phải dùng **Supabase Transaction Mode Pooler** (port 6543) cho `DATABASE_URL`
- Phải dùng **Direct URL** (port 5432) cho `DIRECT_URL` — chỉ dùng khi chạy migrations
- `schema.prisma` cần khai báo `directUrl = env("DIRECT_URL")`

```
# .env.local
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

**Lưu ý về thứ tự card/column**:
- Dùng cột `order` (float/integer) để lưu vị trí → cập nhật hiệu quả khi drag-and-drop
- Kỹ thuật "fractional indexing" cho phép chèn giữa mà không cần rewrite toàn bộ thứ tự

**Các phương án đã xem xét**:
- SQLite: Không phù hợp cho multi-user concurrent writes
- MongoDB: Dữ liệu có cấu trúc rõ, relational → không cần document DB
- Drizzle ORM: Tốt nhưng ít tài liệu hơn Prisma, cộng đồng nhỏ hơn

---

## Quyết định 5: Component Library & Styling

**Quyết định**: **shadcn/ui + Tailwind CSS**

**Lý do chọn**:
- Constitution III đề cập trực tiếp **shadcn/ui** là approved component library
- shadcn/ui dựa trên Radix UI → accessibility tốt (WCAG 2.1 AA), keyboard navigation built-in
- Tailwind CSS cho design tokens, responsive breakpoints (375/768/1280px per Constitution III)
- shadcn/ui components được copy vào dự án → full control, không vendor lock-in
- Tương thích tốt với Next.js App Router

---

## Quyết định 6: State Management

**Quyết định**: **TanStack Query (React Query) cho server state + Zustand cho UI state**

**Lý do chọn**:
- **TanStack Query**: Cache, refetch, optimistic updates — cần thiết cho drag-and-drop (optimistic UI trước khi API confirm)
- **Zustand**: Lightweight (< 1KB gzipped), đơn giản, phù hợp dự án nhỏ — dùng cho drag state, modal state
- Kết hợp này tránh over-engineering (không dùng Redux/MobX cho dự án nhỏ)

**Các phương án đã xem xét**:
- Redux Toolkit: Quá nặng cho dự án nhỏ này
- Jotai: Tốt nhưng Zustand phổ biến và có nhiều ví dụ hơn
- Context API thuần: Không đủ cho optimistic updates phức tạp

---

## Quyết định 7: Testing

**Quyết định**: **Vitest + Testing Library + Playwright**

**Lý do chọn**:
- **Vitest**: Thay thế Jest, nhanh hơn đáng kể, native ESM, tương thích với Vite/Next.js
- **@testing-library/react**: Test từ góc nhìn người dùng, tương thích với Constitution II (TDD)
- **Playwright**: E2E testing, cross-browser, hỗ trợ mobile viewport (375px) — verify drag-and-drop trên touch
- **@axe-core/react** (accessibility gate per Constitution) — integration trong test

---

## Quyết định 8: Deployment

**Quyết định**: **Netlify (frontend + serverless) + Supabase (database) — Free Tier**

**Lý do chọn**:
- Netlify Free Tier: hỗ trợ Next.js App Router đầy đủ qua `@netlify/plugin-nextjs`, CDN global, deploy tự động từ Git
- Supabase Free Tier: PostgreSQL managed + Auth + PgBouncer pooler + dashboard trực quan, không cần quản lý server
- Kết hợp hai nền tảng này phù hợp dự án nhỏ: zero infrastructure cost, zero DevOps

**Ràng buộc Free Tier cần lưu ý**:

| Nền tảng | Ràng buộc | Tác động & Xử lý |
|---|---|---|
| Netlify | Serverless function timeout: **10 giây** | Mọi API route phải hoàn thành trong 10s; tránh vòng lặp query phức tạp |
| Netlify | Build minutes: **300 phút/tháng** | Tối ưu build time; dùng cache dependencies |
| Netlify | Bandwidth: **100 GB/tháng** | Đủ cho nhóm nhỏ; dùng Next.js Image Optimization |
| Netlify | Không có rate limiting built-in | Implement trong Next.js Middleware dùng Supabase làm store đếm attempts |
| Supabase | **Database pause sau 7 ngày không hoạt động** | Hạn chế đã biết; unpaused thủ công qua dashboard; không phù hợp production dài hạn |
| Supabase | Storage: **500 MB** | Thừa cho Kanban board nhỏ |
| Supabase | Bandwidth: **5 GB/tháng** | Đủ cho < 50 người dùng |
| Supabase | Cold starts + shared CPU | p95 latency ≤ 300ms áp dụng cho warm requests; cold start có thể +200–500ms |

**Cấu hình Netlify** (file `netlify.toml` ở root):
```toml
[build]
  command = "npx prisma generate && next build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Biến môi trường cần set trên Netlify dashboard**:
- `DATABASE_URL` — Supabase Pooler URL (port 6543, `?pgbouncer=true`)
- `DIRECT_URL` — Supabase Direct URL (port 5432, dùng cho migrations)
- `AUTH_SECRET` — random string ≥ 32 ký tự
- `AUTH_URL` — URL của Netlify deploy (VD: `https://your-app.netlify.app`)

**Xử lý rate limiting trên Netlify serverless**:
- Netlify Functions không chia sẻ memory → không dùng in-memory counter
- Giải pháp: lưu auth attempt count vào bảng `RateLimitAttempt` trong Supabase, query mỗi request đăng nhập
- Hoặc sử dụng Upstash Redis Free Tier (10,000 commands/ngày) nếu muốn tách biệt
- Lựa chọn đơn giản nhất cho dự án nhỏ: dùng Supabase table (không cần dependency thêm)

**Các phương án đã xem xét**:
- Vercel + Supabase: Vercel có Next.js support tốt hơn nhưng giới hạn Free Tier khắt khe hơn (Hobby plan)
- Render.com: Free tier tắt sau 15 phút không dùng — tệ hơn Supabase 7 ngày
- Railway: Không có free tier vĩnh viễn kể từ 2023
- Self-host (VPS): Overkill cho dự án học tập nhỏ

---

## Tóm tắt Stack

| Hạng mục | Công nghệ được chọn | Phiên bản mục tiêu |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Ngôn ngữ | TypeScript | 5.x |
| UI Library | shadcn/ui + Radix UI | latest |
| Styling | Tailwind CSS | 3.x |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable | 6.x |
| Auth | Auth.js (NextAuth.js v5) | 5.x |
| Database | Supabase (PostgreSQL 15) | — |
| ORM | Prisma | 5.x |
| Server State | TanStack Query | 5.x |
| UI State | Zustand | 4.x |
| Unit/Integration Test | Vitest + @testing-library/react | latest |
| E2E Test | Playwright | latest |
| Lint/Format | ESLint + Prettier | latest |
| Accessibility | @axe-core/react | latest |
| Hosting (app) | Netlify Free Tier | — |
| Hosting (DB) | Supabase Free Tier | — |

---

## Ràng buộc kỹ thuật đã xác định

- **Target Platform**: Web (Browser), responsive 375/768/1280px
- **Project Type**: Full-stack web application (Next.js monorepo)
- **Performance Goals**: LCP ≤ 2.5s (4G), API p95 ≤ 300ms (warm), bundle ≤ 250KB gzipped (critical path)
- **Scale/Scope**: Nhóm nhỏ (< 50 người dùng), không cần WebSocket real-time
- **Security**: httpOnly cookies, CORS allowlist, rate limiting trên auth endpoints (via Supabase), CSP headers
- **Deployment**: Netlify Free Tier (10s function timeout) + Supabase Free Tier (pause sau 7 ngày inactivity)
- **DB connections**: Bắt buộc dùng Supabase Pooler URL cho serverless; `DIRECT_URL` riêng cho migrations
