# Tasks: Team Kanban Board

**Input**: Tài liệu thiết kế từ `/specs/001-team-kanban-board/`

**Tài liệu tham khảo**: plan.md, spec.md, data-model.md, contracts/api.md, research.md

**Ghi chú về Test**: Constitution II (Test-First) là BẮT BUỘC — tests phải được viết TRƯỚC khi implement và phải FAIL trước. Mọi user story đều có test tasks.

**Tổ chức**: Tasks được nhóm theo user story để có thể implement và test độc lập từng story.

## Format: `[ID] [P?] [Story?] Mô tả với đường dẫn file`

- **[P]**: Có thể chạy song song (file khác nhau, không phụ thuộc task chưa hoàn thành)
- **[Story]**: User story tương ứng (US1–US5)
- Đường dẫn file chính xác trong mô tả

---

## Phase 1: Setup (Cơ sở hạ tầng dự án)

**Mục đích**: Khởi tạo dự án Next.js 14 với toàn bộ dependencies và công cụ cần thiết

- [ ] T001 Khởi tạo dự án Next.js 14 với App Router và TypeScript: `npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [ ] T002 Cài đặt dependencies chính: `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities next-auth@beta @prisma/client prisma @tanstack/react-query zustand`
- [ ] T003 [P] Cài đặt dependencies UI: `npx shadcn@latest init` và thêm các component `button card dialog input label textarea select avatar badge`
- [ ] T004 [P] Cài đặt dependencies test: `vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom @axe-core/react @playwright/test`
- [ ] T005 [P] Cấu hình Vitest trong `vitest.config.ts` với jsdom environment và alias `@/`
- [ ] T006 [P] Cấu hình Playwright trong `playwright.config.ts` cho E2E tests tại `tests/e2e/`
- [ ] T007 [P] Tạo `netlify.toml` với `@netlify/plugin-nextjs` và cấu hình build
- [ ] T008 [P] Tạo `.env.example` với các biến: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXTAUTH_URL`
- [ ] T090 Tạo Supabase project tại https://supabase.com — lấy `DATABASE_URL` (Transaction Mode Pooler, port 6543) và `DIRECT_URL` (Direct connection, port 5432), điền vào `.env.local` (không commit file này)
- [ ] T091 [P] Tạo `AUTH_SECRET` bằng `openssl rand -base64 32`, set `AUTH_URL=http://localhost:3000` và `NEXTAUTH_URL=http://localhost:3000` trong `.env.local` — chạy `npx prisma db push` để xác nhận kết nối DB thành công

**Checkpoint**: Dự án khởi tạo xong — `npm run dev` chạy được, kết nối Supabase OK, `npm run test` cấu hình xong

---

## Phase 2: Foundational (Tiền đề bắt buộc — BLOCKS mọi user story)

**Mục đích**: Database schema, authentication, shared utilities — phải hoàn thành trước bất kỳ user story nào

**⚠️ CRITICAL**: Không user story nào có thể bắt đầu cho đến khi phase này hoàn thành

- [ ] T009 Định nghĩa Prisma schema đầy đủ với 7 entity (User, Board, BoardMember, Column, Card, Comment, ActivityLog) và enum (BoardRole, ActivityAction) trong `prisma/schema.prisma` — bao gồm `datasource`, `generator`, `directUrl = env("DIRECT_URL")`
- [ ] T010 Chạy migration đầu tiên: `npx prisma migrate dev --name init` tạo tables trong Supabase
- [ ] T011 [P] Tạo Prisma client singleton trong `src/lib/db.ts` (tránh multiple instances trong development hot-reload)
- [ ] T012 [P] Cấu hình Auth.js v5 trong `src/lib/auth.ts` với Credentials provider (email/password, bcrypt verify) và Prisma adapter
- [ ] T013 Tạo API route handler Auth.js tại `src/app/api/auth/[...nextauth]/route.ts`
- [ ] T014 [P] Tạo endpoint đăng ký tài khoản `POST /api/auth/register` tại `src/app/api/auth/register/route.ts` — validate email/password/name, hash bcrypt (cost ≥ 12), kiểm tra email trùng lặp
- [ ] T015 [P] Định nghĩa shared TypeScript types trong `src/types/index.ts`: `BoardWithDetails`, `CardWithDetails`, `CommentWithAuthor`, `ActivityLogWithActor`, `PaginatedResponse<T>`
- [ ] T016 [P] Tạo authorization helper `src/lib/auth-guard.ts` với hàm `requireBoardMember(boardId, userId)` — kiểm tra BoardMember membership, throw 403 nếu không phải thành viên
- [ ] T017 [P] Tạo activity log service `src/lib/activity.ts` với hàm `createActivityEntry(params)` — ghi ActivityLog trong cùng Prisma transaction với hành động chính
- [ ] T018 [P] Tạo shared utilities `src/lib/utils.ts`: `cn()` (classnames), `generateOrder()` (fractional indexing cho order float), `formatRelativeTime()`
- [ ] T019 [P] Cấu hình `next.config.ts` với CSP headers (`Content-Security-Policy`), CORS headers, và security headers (`X-Frame-Options`, `X-Content-Type-Options`)
- [ ] T020 Tạo middleware `src/middleware.ts` với Auth.js session check — redirect unauthenticated users từ protected routes về `/login`

**Checkpoint**: Foundation sẵn sàng — database schema tồn tại, auth hoạt động, authorization helper có thể dùng được

---

## Phase 3: User Story 1 — Board & Column Management (Priority: P1) 🎯 MVP

**Goal**: Người dùng có thể đăng ký tài khoản, tạo board, thêm/sửa/xóa/reorder columns. Đây là foundation của toàn bộ ứng dụng.

**Independent Test**: Đăng ký tài khoản → tạo board với 3 columns → đổi tên 1 column → reorder columns → xóa 1 column → board vẫn hoạt động đúng.

### Tests cho User Story 1 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [ ] T021 [P] [US1] Unit test cho `POST /api/auth/register`: valid registration, duplicate email, invalid email format trong `tests/unit/api/auth/register.test.ts`
- [ ] T022 [P] [US1] Integration test cho board CRUD: tạo board, lấy danh sách, lấy chi tiết board trong `tests/integration/boards.test.ts`
- [ ] T023 [P] [US1] Integration test cho column CRUD: tạo column, đổi tên, xóa empty column, xóa column có cards (cần confirm) trong `tests/integration/columns.test.ts`
- [ ] T024 [US1] E2E test cho acceptance scenarios US1: register → create board → add 3 columns → rename column → reorder → delete column trong `tests/e2e/us1-board-column.spec.ts`

### Implementation cho User Story 1

- [ ] T025 [P] [US1] Tạo API route `GET /api/boards` và `POST /api/boards` trong `src/app/api/boards/route.ts` — GET lấy boards của user hiện tại, POST tạo board mới (validate name, tạo BoardMember OWNER)
- [ ] T026 [P] [US1] Tạo API route `GET /api/boards/[boardId]` trong `src/app/api/boards/[boardId]/route.ts` — lấy board với columns và cards, kiểm tra membership, PATCH rename board, DELETE board (owner only)
- [ ] T027 [P] [US1] Tạo API route `POST /api/boards/[boardId]/members` trong `src/app/api/boards/[boardId]/members/route.ts` — mời thành viên qua email (OWNER only, max 20 members)
- [ ] T028 [P] [US1] Tạo API route `POST /api/boards/[boardId]/columns` trong `src/app/api/boards/[boardId]/columns/route.ts` — tạo column mới với fractional order
- [ ] T029 [P] [US1] Tạo API route `PATCH /api/boards/[boardId]/columns/[columnId]` và `DELETE` trong `src/app/api/boards/[boardId]/columns/[columnId]/route.ts` — PATCH cập nhật name/order, DELETE với 409 nếu có cards và chưa `?confirm=true`, ghi ActivityLog
- [ ] T030 [US1] Tạo trang Auth: Login page tại `src/app/(auth)/login/page.tsx` với form email/password, submit gọi Auth.js `signIn("credentials")`
- [ ] T031 [US1] Tạo trang Auth: Register page tại `src/app/(auth)/register/page.tsx` với form name/email/password, gọi `POST /api/auth/register`
- [ ] T032 [US1] Tạo Dashboard page tại `src/app/(dashboard)/page.tsx` — danh sách boards của user, nút tạo board mới
- [ ] T033 [P] [US1] Tạo component `BoardCard` tại `src/components/board/BoardCard.tsx` — hiển thị board name, member count, link đến board view
- [ ] T034 [P] [US1] Tạo component `CreateBoardDialog` tại `src/components/board/CreateBoardDialog.tsx` — modal tạo board mới với form name
- [ ] T035 [US1] Tạo Board page tại `src/app/boards/[boardId]/page.tsx` — server component fetch board data, render columns và cards
- [ ] T036 [P] [US1] Tạo component `ColumnList` tại `src/components/board/ColumnList.tsx` — container hiển thị danh sách columns ngang, nút "Add column"
- [ ] T037 [P] [US1] Tạo component `Column` tại `src/components/board/Column.tsx` — hiển thị column header (tên, số card), inline rename, nút xóa với confirmation dialog nếu có cards
- [ ] T038 [P] [US1] Tạo TanStack Query hooks cho board operations trong `src/hooks/useBoards.ts`: `useBoards()`, `useBoard(boardId)`, `useCreateBoard()`, `useUpdateBoard()`, `useDeleteBoard()`
- [ ] T039 [P] [US1] Tạo TanStack Query hooks cho column operations trong `src/hooks/useColumns.ts`: `useCreateColumn()`, `useUpdateColumn()`, `useDeleteColumn()`
- [ ] T040 [US1] Cấu hình TanStack Query provider trong `src/app/providers.tsx` và wrap trong root layout `src/app/layout.tsx`

**Checkpoint**: US1 hoạt động độc lập — người dùng có thể đăng ký, đăng nhập, tạo board, thêm/sửa/xóa columns

---

## Deploy MVP: Board & Column Management lên Netlify + Supabase 🚀

**Mục đích**: Deploy MVP (Phase 1–3) lên production để xem kết quả thực tế, demo và nhận feedback trước khi implement tiếp

**Điều kiện**: Phase 3 hoàn thành + tất cả tests US1 pass

- [ ] T092 Chạy Prisma migration trên production database: `npx prisma migrate deploy` (dùng `DIRECT_URL` port 5432) — xác nhận tất cả 7 tables tồn tại trong Supabase Dashboard
- [ ] T093 Kết nối GitHub repo với Netlify — vào Netlify Dashboard → "Add new site" → "Import from Git", chọn repo, set build command `npm run build`, publish directory `.next`
- [ ] T094 [P] Set environment variables trên Netlify Dashboard (Site settings → Environment variables): `DATABASE_URL` (pooler port 6543), `DIRECT_URL` (direct port 5432), `AUTH_SECRET`, `AUTH_URL` và `NEXTAUTH_URL` (https://\<your-site\>.netlify.app)
- [ ] T095 Trigger deploy đầu tiên — kiểm tra Netlify build log, xác nhận deploy thành công không có lỗi, truy cập production URL
- [ ] T096 Smoke test MVP trên production URL: đăng ký tài khoản → đăng nhập → tạo board → thêm 3 columns → đổi tên column → xóa column — xác nhận US1 acceptance scenarios hoạt động đúng trên production

**Checkpoint**: ✅ MVP live trên Netlify — share URL để demo, nhận feedback trước khi tiếp tục implement US2–US5

---

## Phase 4: User Story 2 — Card (Task) Management (Priority: P2)

**Goal**: Thành viên có thể tạo card trong column, xem chi tiết, sửa title/description, và xóa card.

**Independent Test**: Tạo card trong column → mở card detail (title, description) → chỉnh sửa title và description → xóa card → column trở về trạng thái ban đầu.

### Tests cho User Story 2 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [ ] T041 [P] [US2] Integration test cho card CRUD: tạo card, lấy chi tiết, cập nhật title/description, xóa card trong `tests/integration/cards.test.ts`
- [ ] T042 [US2] E2E test cho acceptance scenarios US2: create card → open detail → edit title → edit description → delete card trong `tests/e2e/us2-card-management.spec.ts`

### Implementation cho User Story 2

- [ ] T043 [P] [US2] Tạo API route `POST /api/boards/[boardId]/cards` trong `src/app/api/boards/[boardId]/cards/route.ts` — tạo card mới với columnId và title, validate required fields, tính fractional order
- [ ] T044 [P] [US2] Tạo API route `GET`, `PATCH`, `DELETE /api/boards/[boardId]/cards/[cardId]` trong `src/app/api/boards/[boardId]/cards/[cardId]/route.ts` — GET trả về card với assignee và comments, PATCH cập nhật title/description/assigneeId, DELETE xóa card và ghi ActivityLog
- [ ] T045 [P] [US2] Tạo component `CardPreview` tại `src/components/card/CardPreview.tsx` — hiển thị card trong column view: title truncated, assignee avatar, comment count, nút mở detail
- [ ] T046 [P] [US2] Tạo component `CardDetail` tại `src/components/card/CardDetail.tsx` — sheet/drawer side panel hiển thị đầy đủ title, editable description (textarea), assignee section, comments section
- [ ] T047 [P] [US2] Tạo component `AddCardForm` tại `src/components/card/AddCardForm.tsx` — form inline ở cuối mỗi column để tạo card mới nhanh, validate required title
- [ ] T048 [P] [US2] Tạo TanStack Query hooks cho card operations trong `src/hooks/useCards.ts`: `useCard(cardId)`, `useCreateCard()`, `useUpdateCard()`, `useDeleteCard()`
- [ ] T049 [US2] Tích hợp `CardPreview` và `AddCardForm` vào component `Column` tại `src/components/board/Column.tsx` — hiển thị danh sách cards và form thêm card

**Checkpoint**: US2 hoạt động độc lập — full CRUD cho cards, xem được card detail

- [ ] T097 Redeploy sau US2 — push code lên GitHub (Netlify auto-deploy), sau khi build xong smoke test card CRUD trên production URL

---

## Phase 5: User Story 3 — Drag-and-Drop Card Movement (Priority: P3)

**Goal**: Người dùng drag card giữa các columns và reorder cards/columns. Thay đổi được lưu ngay lập tức, hoạt động trên cả mobile (touch).

**Independent Test**: Drag card từ "To Do" → "In Progress" → refresh trang → card vẫn ở "In Progress". Drag reorder cards trong cùng column → refresh → thứ tự được giữ.

### Tests cho User Story 3 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [ ] T050 [P] [US3] Integration test cho `PATCH /api/.../cards/[cardId]/move`: di chuyển card giữa columns, xác nhận columnId và order được cập nhật trong `tests/integration/card-move.test.ts`
- [ ] T051 [US3] E2E test cho acceptance scenarios US3: drag card sang column khác → verify persistence → drag reorder in-column → touch drag simulation trong `tests/e2e/us3-drag-drop.spec.ts`

### Implementation cho User Story 3

- [ ] T052 [P] [US3] Tạo API route `PATCH /api/boards/[boardId]/cards/[cardId]/move` trong `src/app/api/boards/[boardId]/cards/[cardId]/move/route.ts` — cập nhật `columnId` và `order` trong cùng transaction, ghi ActivityLog `CARD_MOVED` với metadata `{fromColumnId, fromColumnName, toColumnId, toColumnName}`
- [ ] T053 [P] [US3] Tạo API route `PATCH /api/boards/[boardId]/columns/[columnId]` order update đã có tại T029 — xác nhận hỗ trợ reorder column qua `order` field
- [ ] T054 [US3] Tạo `DndBoardProvider` tại `src/components/board/DndBoardProvider.tsx` — wrap DndKit `DndContext` với `PointerSensor` + `TouchSensor` (activation constraints cho touch), `closestCorners` collision detection
- [ ] T055 [P] [US3] Tạo component `SortableCard` tại `src/components/board/SortableCard.tsx` — wrap `CardPreview` với `useSortable` hook từ @dnd-kit/sortable, cung cấp drag handle
- [ ] T056 [P] [US3] Tạo component `DroppableColumn` tại `src/components/board/DroppableColumn.tsx` — wrap Column với `useDroppable`, visual feedback khi có card đang drag qua
- [ ] T057 [P] [US3] Tạo component `DragOverlay` tại `src/components/board/DragOverlay.tsx` — hiển thị card ghost khi đang drag (card preview với opacity thấp hơn)
- [ ] T058 [US3] Implement drag-and-drop logic trong `DndBoardProvider`: `onDragStart`, `onDragOver` (optimistic UI update với Zustand local state), `onDragEnd` (gọi move API, rollback nếu lỗi, hiện toast thông báo lỗi kết nối)
- [ ] T059 [P] [US3] Tạo Zustand store `src/store/boardStore.ts` — local state cho board (columns + cards order), actions: `moveCard`, `reorderCard`, `reorderColumn` cho optimistic updates
- [ ] T060 [P] [US3] Tạo hook `useMoveCard()` trong `src/hooks/useCards.ts` — TanStack Query mutation gọi `PATCH .../move`, invalidate board query sau khi thành công
- [ ] T061 [US3] Tích hợp DnD vào Board page tại `src/app/boards/[boardId]/page.tsx` — wrap với `DndBoardProvider`, sử dụng `SortableCard` và `DroppableColumn`, horizontal scroll trên mobile

**Checkpoint**: US3 hoạt động — drag-and-drop hoạt động desktop và mobile, changes persisted sau refresh

- [ ] T098 Redeploy sau US3 — push code, smoke test drag-and-drop trên production (cả desktop và mobile browser)

---

## Phase 6: User Story 4 — Card Assignment & Comments (Priority: P4)

**Goal**: Thành viên có thể assign card cho người trong team và để lại comments. Chỉ tác giả comment mới xóa được comment của mình.

**Independent Test**: Mời thành viên thứ 2 vào board → mở card → assign cho thành viên đó → tên assignee hiển thị trên card → post comment → comment hiển thị với tên tác giả và timestamp → xóa comment của mình → không xóa được comment người khác.

### Tests cho User Story 4 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [ ] T062 [P] [US4] Integration test cho assignment: PATCH card với `assigneeId`, kiểm tra assignee phải là board member trong `tests/integration/card-assignment.test.ts`
- [ ] T063 [P] [US4] Integration test cho comments: POST comment, DELETE own comment, DELETE other's comment (expect 403) trong `tests/integration/comments.test.ts`
- [ ] T064 [US4] E2E test cho acceptance scenarios US4: assign card → verify avatar on board → add comment → verify author name + timestamp → delete own comment trong `tests/e2e/us4-assignment-comments.spec.ts`

### Implementation cho User Story 4

- [ ] T065 [P] [US4] Tạo API route `POST /api/boards/[boardId]/cards/[cardId]/comments` trong `src/app/api/boards/[boardId]/cards/[cardId]/comments/route.ts` — validate content (1–2000 ký tự), ghi ActivityLog `COMMENT_ADDED`
- [ ] T066 [P] [US4] Tạo API route `DELETE /api/boards/[boardId]/cards/[cardId]/comments/[commentId]` trong `src/app/api/boards/[boardId]/cards/[cardId]/comments/[commentId]/route.ts` — kiểm tra `comment.authorId === currentUserId`, trả 403 nếu không phải tác giả, ghi ActivityLog `COMMENT_DELETED`
- [ ] T067 [US4] Cập nhật `PATCH /api/boards/[boardId]/cards/[cardId]` trong `src/app/api/boards/[boardId]/cards/[cardId]/route.ts` — xử lý `assigneeId`: kiểm tra assignee là board member, ghi ActivityLog `CARD_ASSIGNED` hoặc `CARD_UNASSIGNED`
- [ ] T068 [P] [US4] Tạo component `AssigneeSelector` tại `src/components/card/AssigneeSelector.tsx` — dropdown chọn thành viên board (dùng shadcn/ui Select hoặc Combobox), hiển thị avatar + tên, option "Bỏ assign"
- [ ] T069 [P] [US4] Tạo component `CommentList` tại `src/components/card/CommentList.tsx` — hiển thị danh sách comments với avatar tác giả, tên, timestamp (relative), nút xóa chỉ hiện với comment của mình
- [ ] T070 [P] [US4] Tạo component `CommentForm` tại `src/components/card/CommentForm.tsx` — textarea submit comment, validate 1–2000 ký tự, clear sau khi submit thành công
- [ ] T071 [P] [US4] Tạo TanStack Query hooks cho comment operations trong `src/hooks/useComments.ts`: `useCreateComment()`, `useDeleteComment()`
- [ ] T072 [US4] Tích hợp `AssigneeSelector`, `CommentList`, `CommentForm` vào `CardDetail` tại `src/components/card/CardDetail.tsx` — layout đầy đủ với sections cho assignee và comments, hiển thị assignee avatar nhỏ trên `CardPreview`

**Checkpoint**: US4 hoạt động — assignment và comments đầy đủ, authorization đúng

- [ ] T099 Redeploy sau US4 — push code, smoke test assign card + comment trên production URL

---

## Phase 7: User Story 5 — Activity Log (Priority: P5)

**Goal**: Thành viên xem lịch sử hoạt động của board theo thứ tự ngược thời gian, có phân trang.

**Independent Test**: Tạo card → move card → add comment → mở activity log → thấy 3 entries theo đúng thứ tự → trang 1 hiển thị tối đa 20 entries → có "Load more" nếu có thêm.

### Tests cho User Story 5 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [ ] T073 [P] [US5] Integration test cho `GET /api/boards/[boardId]/activity`: pagination (page/pageSize), verify các activity types đã được ghi, empty state trong `tests/integration/activity.test.ts`
- [ ] T074 [US5] E2E test cho acceptance scenarios US5: perform actions → open activity log → verify entries → verify pagination trong `tests/e2e/us5-activity-log.spec.ts`

### Implementation cho User Story 5

- [ ] T075 [P] [US5] Tạo API route `GET /api/boards/[boardId]/activity` trong `src/app/api/boards/[boardId]/activity/route.ts` — query ActivityLog với pagination (pageSize = 20), sort `createdAt DESC`, include actor (id, name, avatarUrl), trả `{items, total, page, pageSize, hasMore}`
- [ ] T076 [P] [US5] Tạo component `ActivityLog` tại `src/components/activity/ActivityLog.tsx` — danh sách entries reverse-chronological, infinite scroll hoặc "Load more" button, empty state message
- [ ] T077 [P] [US5] Tạo component `ActivityEntry` tại `src/components/activity/ActivityEntry.tsx` — hiển thị actor avatar + tên, mô tả hành động (dịch ActivityAction sang câu tiếng Việt dễ đọc: "đã di chuyển card X từ Y sang Z"), relative timestamp
- [ ] T078 [P] [US5] Tạo TanStack Query hook `useActivityLog(boardId)` trong `src/hooks/useActivity.ts` — infinite query với `getNextPageParam`, prefetch page 1
- [ ] T079 [US5] Tích hợp `ActivityLog` vào Board page tại `src/app/boards/[boardId]/page.tsx` — sidebar hoặc tab riêng, link từ board header

**Checkpoint**: US5 hoạt động — activity log hiển thị đúng, pagination hoạt động, tất cả 5 user stories hoàn chỉnh

- [ ] T100 Redeploy sau US5 — push code, smoke test toàn bộ US1–US5 trên production URL trước khi vào phase Polish

---

## Phase 8: Polish & Cross-Cutting Concerns

**Mục đích**: Bổ sung các yêu cầu phi chức năng, bảo mật, performance, accessibility

- [ ] T080 [P] Implement rate limiting cho auth endpoints bằng Supabase table — tạo bảng `rate_limit_attempts` trong Prisma schema, middleware kiểm tra ≤ 10 attempts/minute/IP tại `src/lib/rate-limit.ts`
- [ ] T081 [P] Cấu hình CORS allowlist trong `src/middleware.ts` — chỉ cho phép `AUTH_URL` origin, reject tất cả requests khác với 403
- [ ] T082 Kiểm tra và bổ sung CSP headers trong `next.config.ts` — `script-src 'self'`, `style-src 'self' 'unsafe-inline'` (Tailwind), `img-src 'self' data: blob:`
- [ ] T083 [P] Accessibility audit — chạy `@axe-core/react` trong Vitest cho các components chính: `Column`, `CardDetail`, `ActivityLog` tại `tests/unit/a11y/`; sửa violations WCAG 2.1 AA
- [ ] T084 [P] Responsive testing — verify layout tại 375px (mobile), 768px (tablet), 1280px (desktop): board view có horizontal scroll trên mobile, card detail responsive trên tablet
- [ ] T085 [P] Performance audit — chạy `npm run build` và kiểm tra bundle size (≤ 250KB gzipped critical path), thêm dynamic imports cho `CardDetail` và `ActivityLog`
- [ ] T086 Kiểm tra N+1 queries — review Prisma queries trong board API route, thêm `include` thay vì multiple queries, đảm bảo activity log paginated (pageSize = 20)
- [ ] T087 [P] Chạy `npm audit --audit-level=high` — resolve mọi high/critical vulnerability; cấu hình pre-commit hook với secret scanning
- [ ] T088 Chạy toàn bộ test suite: `npm run test` (Vitest) + `npx playwright test` (E2E) — đảm bảo coverage ≥ 80% trên tất cả code mới
- [ ] T089 Validate theo `quickstart.md` — chạy từng bước trong quickstart guide để confirm feature hoàn chỉnh end-to-end

---

## Dependencies & Thứ tự Thực thi

### Phase Dependencies

- **Phase 1 (Setup)**: Không phụ thuộc — bắt đầu ngay (bao gồm T090–T091 Supabase setup)
- **Phase 2 (Foundational)**: Phụ thuộc Phase 1 hoàn thành (đặc biệt T090–T091 cho DB connection) — BLOCKS tất cả user stories
- **Phase 3 (US1)**: Phụ thuộc Phase 2 hoàn thành
- **Deploy MVP**: Phụ thuộc Phase 3 hoàn thành — deploy lên production trước khi tiếp tục
- **Phase 4–7 (US2–US5)**: Mỗi story phụ thuộc Deploy MVP (T092–T096) đã hoàn thành; kèm redeploy checkpoint sau mỗi story
- **Phase 8 (Polish)**: Phụ thuộc tất cả user stories muốn bao gồm đã hoàn thành

### User Story Dependencies

- **US1 (P1)**: Độc lập sau Phase 2 — không phụ thuộc story khác
- **US2 (P2)**: Độc lập sau Phase 2 — có thể chạy song song với US1 nhưng cần Column component từ US1 để integrate
- **US3 (P3)**: Phụ thuộc US1 + US2 (cần có Board + Column + Card UI để add DnD)
- **US4 (P4)**: Phụ thuộc US2 (cần CardDetail, cần card endpoint); độc lập với US3
- **US5 (P5)**: Phụ thuộc Foundation (ActivityLog service ở T017) đã ghi entries từ US1–US4

### Trong mỗi User Story

- Tests PHẢI được viết trước và FAIL trước khi implement
- API routes trước components
- Hooks trước component integration
- Core implementation trước integration với components khác

### Cơ hội Song song

- Tất cả tasks Phase 1 có nhãn [P] có thể chạy song song
- Tất cả tasks Phase 2 có nhãn [P] có thể chạy song song trong Phase 2
- Sau Phase 2: US1 và US2 có thể chạy song song bởi 2 developer
- US3 cần chờ đủ foundation UI từ US1 và US2
- US4 có thể song song với US3 (khác files, không conflict)
- US5 có thể song song với US4 (API route + UI độc lập)

---

## Ví dụ Song song: User Story 1

```bash
# Developer A chạy đồng thời sau khi tests T021-T023 đã viết xong:
Task T025: API route boards
Task T026: API route board detail
Task T027: API route board members

# Developer B chạy đồng thời:
Task T028: API route columns POST
Task T029: API route columns PATCH/DELETE
Task T033: Component BoardCard
Task T034: Component CreateBoardDialog
```

---

## Chiến lược Implementation

### MVP First (Chỉ User Story 1 + Deploy)

1. Hoàn thành Phase 1: Setup (bao gồm T090–T091: tạo Supabase project, lấy credentials)
2. Hoàn thành Phase 2: Foundational (BẮT BUỘC — blocks mọi story)
3. Hoàn thành Phase 3: User Story 1
4. **DỪNG và VALIDATE**: Test US1 độc lập
5. **Deploy MVP** (T092–T096): kết nối Netlify, set env vars, deploy, smoke test trên production URL
6. Share URL → nhận feedback → quyết định tiếp tục story nào

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation (DB + Auth sẵn sàng)
2. Phase 3 → MVP: board + column management
3. **Deploy MVP** → 🚀 Live trên Netlify, có thể demo ngay
4. Phase 4 + T097 redeploy → Card management live
5. Phase 5 + T098 redeploy → Drag-and-drop live
6. Phase 6 + T099 redeploy → Assignment + comments live
7. Phase 7 + T100 redeploy → Activity log live
8. Phase 8 → Polish + security hardening → Production ready

### TDD Workflow (Constitution II — BẮT BUỘC)

Với mỗi user story:
1. Viết tất cả test tasks trước
2. Chạy tests → xác nhận FAIL
3. Implement từng feature
4. Chạy tests → đạt GREEN
5. Refactor nếu cần → tests vẫn GREEN

---

## Ghi chú

- `[P]` tasks = files khác nhau, không phụ thuộc nhau → có thể chạy song song
- `[Story]` label ánh xạ task với user story cụ thể để traceability
- Mỗi user story phải hoàn toàn implement và test được độc lập
- **Constitution II (Test-First)** là NON-NEGOTIABLE: viết tests trước, đảm bảo FAIL, rồi mới implement
- Commit sau mỗi task hoặc nhóm logic hợp lý
- Không merge nếu có test đỏ hoặc lint error
