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

- [X] T001 Khởi tạo dự án Next.js 14 với App Router và TypeScript
- [X] T002 Cài đặt dependencies chính
- [X] T003 [P] Cài đặt dependencies UI (shadcn/ui components tạo thủ công)
- [X] T004 [P] Cài đặt dependencies test
- [X] T005 [P] Cấu hình Vitest trong `vitest.config.ts`
- [X] T006 [P] Cấu hình Playwright trong `playwright.config.ts`
- [X] T007 [P] Tạo `netlify.toml`
- [X] T008 [P] Tạo `.env.example`
- [X] T090 Tạo Supabase project
- [X] T091 [P] Tạo `AUTH_SECRET`, set `.env`, chạy `npx prisma db push`

**Checkpoint**: Dự án khởi tạo xong — `npm run dev` chạy được, kết nối Supabase OK, `npm run test` cấu hình xong

---

## Phase 2: Foundational (Tiền đề bắt buộc — BLOCKS mọi user story)

**Mục đích**: Database schema, authentication, shared utilities — phải hoàn thành trước bất kỳ user story nào

**⚠️ CRITICAL**: Không user story nào có thể bắt đầu cho đến khi phase này hoàn thành

- [X] T009 Định nghĩa Prisma schema đầy đủ với 7 entity trong `prisma/schema.prisma`
- [X] T010 Chạy migration đầu tiên: `npx prisma migrate dev --name init`
- [X] T011 [P] Tạo Prisma client singleton trong `src/lib/db.ts`
- [X] T012 [P] Cấu hình Auth.js v5 trong `src/lib/auth.ts`
- [X] T013 Tạo API route handler Auth.js tại `src/app/api/auth/[...nextauth]/route.ts`
- [X] T014 [P] Tạo endpoint đăng ký tài khoản `POST /api/auth/register`
- [X] T015 [P] Định nghĩa shared TypeScript types trong `src/types/index.ts`
- [X] T016 [P] Tạo authorization helper `src/lib/auth-guard.ts`
- [X] T017 [P] Tạo activity log service `src/lib/activity.ts`
- [X] T018 [P] Tạo shared utilities `src/lib/utils.ts`
- [X] T019 [P] Cấu hình `next.config.mjs` với security headers
- [X] T020 Tạo middleware `src/middleware.ts`

**Checkpoint**: Foundation sẵn sàng — database schema tồn tại, auth hoạt động, authorization helper có thể dùng được

---

## Phase 3: User Story 1 — Board & Column Management (Priority: P1) 🎯 MVP

**Goal**: Người dùng có thể đăng ký tài khoản, tạo board, thêm/sửa/xóa/reorder columns. Đây là foundation của toàn bộ ứng dụng.

**Independent Test**: Đăng ký tài khoản → tạo board với 3 columns → đổi tên 1 column → reorder columns → xóa 1 column → board vẫn hoạt động đúng.

### Tests cho User Story 1 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [X] T021 [P] [US1] Unit test cho `POST /api/auth/register` trong `tests/unit/api/auth/register.test.ts`
- [X] T022 [P] [US1] Integration test cho board CRUD trong `tests/integration/boards.test.ts`
- [X] T023 [P] [US1] Integration test cho column CRUD trong `tests/integration/columns.test.ts`
- [X] T024 [US1] E2E test US1 trong `tests/e2e/us1-board-column.spec.ts`

### Implementation cho User Story 1

- [X] T025 [P] [US1] `GET /api/boards` và `POST /api/boards` trong `src/app/api/boards/route.ts`
- [X] T026 [P] [US1] `GET/PATCH/DELETE /api/boards/[boardId]` trong `src/app/api/boards/[boardId]/route.ts`
- [X] T027 [P] [US1] `POST /api/boards/[boardId]/members` trong `src/app/api/boards/[boardId]/members/route.ts`
- [X] T028 [P] [US1] `POST /api/boards/[boardId]/columns` trong `src/app/api/boards/[boardId]/columns/route.ts`
- [X] T029 [P] [US1] `PATCH/DELETE /api/boards/[boardId]/columns/[columnId]`
- [X] T030 [US1] Login page tại `src/app/(auth)/login/page.tsx`
- [X] T031 [US1] Register page tại `src/app/(auth)/register/page.tsx`
- [X] T032 [US1] Dashboard page tại `src/app/(dashboard)/page.tsx`
- [X] T033 [P] [US1] Component `BoardCard` tại `src/components/board/BoardCard.tsx`
- [X] T034 [P] [US1] Component `CreateBoardDialog` tại `src/components/board/CreateBoardDialog.tsx`
- [X] T035 [US1] Board page tại `src/app/boards/[boardId]/page.tsx`
- [X] T036 [P] [US1] Component `ColumnList` tại `src/components/board/ColumnList.tsx`
- [X] T037 [P] [US1] Component `Column` tại `src/components/board/Column.tsx`
- [X] T038 [P] [US1] TanStack Query hooks trong `src/hooks/useBoards.ts`
- [X] T039 [P] [US1] TanStack Query hooks trong `src/hooks/useColumns.ts`
- [X] T040 [US1] TanStack Query provider trong `src/app/providers.tsx` và root layout
- [X] T101 [US1] Cập nhật màu nền board và column trong `src/components/board/Column.tsx`, `src/components/board/ColumnList.tsx` và `src/app/globals.css` theo tông nhẹ, dịu mắt, hiện đại

**Checkpoint**: US1 hoạt động độc lập — người dùng có thể đăng ký, đăng nhập, tạo board, thêm/sửa/xóa columns

---

## Deploy MVP: Board & Column Management lên Netlify + Supabase 🚀

**Mục đích**: Deploy MVP (Phase 1–3) lên production để xem kết quả thực tế, demo và nhận feedback trước khi implement tiếp

**Điều kiện**: Phase 3 hoàn thành + tất cả tests US1 pass

- [X] T092 Chạy Prisma migration trên production database: `npx prisma migrate deploy` (dùng `DIRECT_URL` port 5432) — xác nhận tất cả 7 tables tồn tại trong Supabase Dashboard
- [X] T093 Kết nối GitHub repo với Netlify — vào Netlify Dashboard → "Add new site" → "Import from Git", chọn repo, set build command `npm run build`, publish directory `.next`
- [X] T094 [P] Set environment variables trên Netlify Dashboard (Site settings → Environment variables): `DATABASE_URL` (pooler port 6543), `DIRECT_URL` (direct port 5432), `AUTH_SECRET`, `AUTH_URL` và `NEXTAUTH_URL` (https://\<your-site\>.netlify.app)
- [X] T095 Trigger deploy đầu tiên — kiểm tra Netlify build log, xác nhận deploy thành công không có lỗi, truy cập production URL
- [X] T096 Smoke test MVP trên production URL: đăng ký tài khoản → đăng nhập → tạo board → thêm 3 columns → đổi tên column → xóa column — xác nhận US1 acceptance scenarios hoạt động đúng trên production

**Checkpoint**: ✅ MVP live trên Netlify — share URL để demo, nhận feedback trước khi tiếp tục implement US2–US5

---

## Phase 4: User Story 2 — Card (Task) Management (Priority: P2)

**Goal**: Thành viên có thể tạo card trong column, xem chi tiết, sửa title/description, và xóa card.

**Independent Test**: Tạo card trong column → mở card detail (title, description) → chỉnh sửa title và description → xóa card → column trở về trạng thái ban đầu.

### Tests cho User Story 2 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [X] T041 [P] [US2] Integration test cho card CRUD trong `tests/integration/cards.test.ts`
- [X] T042 [US2] E2E test US2 trong `tests/e2e/us2-card-management.spec.ts`

### Implementation cho User Story 2

- [X] T043 [P] [US2] `POST /api/boards/[boardId]/cards` trong `src/app/api/boards/[boardId]/cards/route.ts`
- [X] T044 [P] [US2] `GET/PATCH/DELETE /api/boards/[boardId]/cards/[cardId]`
- [X] T045 [P] [US2] Component `CardPreview` tại `src/components/card/CardPreview.tsx`
- [X] T046 [P] [US2] Component `CardDetail` tại `src/components/card/CardDetail.tsx`
- [X] T047 [P] [US2] Component `AddCardForm` tại `src/components/card/AddCardForm.tsx`
- [X] T048 [P] [US2] TanStack Query hooks trong `src/hooks/useCards.ts`
- [X] T049 [US2] Tích hợp `CardPreview` và `AddCardForm` vào `Column`

**Checkpoint**: US2 hoạt động độc lập — full CRUD cho cards, xem được card detail

- [X] T097 Redeploy sau US2 — push code lên GitHub (Netlify auto-deploy), sau khi build xong smoke test card CRUD trên production URL

---

## Phase 5: User Story 3 — Drag-and-Drop Card Movement (Priority: P3)

**Goal**: Người dùng drag card giữa các columns và reorder cards/columns. Thay đổi được lưu ngay lập tức, hoạt động trên cả mobile (touch).

**Independent Test**: Drag card từ "To Do" → "In Progress" → refresh trang → card vẫn ở "In Progress". Drag reorder cards trong cùng column → refresh → thứ tự được giữ.

### Tests cho User Story 3 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [X] T050 [P] [US3] Integration test cho card move trong `tests/integration/card-move.test.ts`
- [X] T051 [US3] E2E test US3 trong `tests/e2e/us3-drag-drop.spec.ts`

### Implementation cho User Story 3

- [X] T052 [P] [US3] `PATCH /api/boards/[boardId]/cards/[cardId]/move`
- [X] T053 [P] [US3] Column PATCH hỗ trợ reorder đã có ở T029
- [X] T054 [US3] `DndBoardProvider` tại `src/components/board/DndBoardProvider.tsx`
- [X] T055 [P] [US3] Component `SortableCard` tại `src/components/board/SortableCard.tsx`
- [X] T056 [P] [US3] Component `DroppableColumn` tại `src/components/board/DroppableColumn.tsx`
- [X] T057 [P] [US3] Component `DragOverlay` tại `src/components/board/DragOverlay.tsx`
- [X] T058 [US3] DnD logic trong `DndBoardProvider`
- [X] T059 [P] [US3] Zustand store `src/store/boardStore.ts`
- [X] T060 [P] [US3] Hook `useMoveCard()` trong `src/hooks/useCards.ts`
- [X] T061 [US3] Tích hợp DnD vào Board page qua `ColumnList` và `Column`

**Checkpoint**: US3 hoạt động — drag-and-drop hoạt động desktop và mobile, changes persisted sau refresh

- [ ] T098 Redeploy sau US3 — push code, smoke test drag-and-drop trên production (cả desktop và mobile browser)

---

## Phase 6: User Story 4 — Card Assignment & Comments (Priority: P4)

**Goal**: Thành viên có thể assign card cho người trong team và để lại comments. Chỉ tác giả comment mới xóa được comment của mình.

**Independent Test**: Mời thành viên thứ 2 vào board → mở card → assign cho thành viên đó → tên assignee hiển thị trên card → post comment → comment hiển thị với tên tác giả và timestamp → xóa comment của mình → không xóa được comment người khác.

### Tests cho User Story 4 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [X] T062 [P] [US4] Integration test assignment trong `tests/integration/card-assignment.test.ts`
- [X] T063 [P] [US4] Integration test comments trong `tests/integration/card-assignment.test.ts`
- [X] T064 [US4] E2E test US4 trong `tests/e2e/us4-assignment-comments.spec.ts`

### Implementation cho User Story 4

- [X] T065 [P] [US4] `POST /api/boards/[boardId]/cards/[cardId]/comments`
- [X] T066 [P] [US4] `DELETE .../comments/[commentId]`
- [X] T067 [US4] `PATCH /api/boards/[boardId]/cards/[cardId]` xử lý assigneeId
- [X] T068 [P] [US4] Component `AssigneeSelector` tại `src/components/card/AssigneeSelector.tsx`
- [X] T069 [P] [US4] Component `CommentList` tại `src/components/card/CommentList.tsx`
- [X] T070 [P] [US4] Component `CommentForm` tại `src/components/card/CommentForm.tsx`
- [X] T071 [P] [US4] TanStack Query hooks trong `src/hooks/useComments.ts`
- [X] T072 [US4] Tích hợp AssigneeSelector + CommentList + CommentForm vào `CardDetail`

**Checkpoint**: US4 hoạt động — assignment và comments đầy đủ, authorization đúng

- [X] T099 Redeploy sau US4 — push code, smoke test assign card + comment trên production URL

---

## Phase 7: User Story 5 — Activity Log (Priority: P5)

**Goal**: Thành viên xem lịch sử hoạt động của board theo thứ tự ngược thời gian, có phân trang.

**Independent Test**: Tạo card → move card → add comment → mở activity log → thấy 3 entries theo đúng thứ tự → trang 1 hiển thị tối đa 20 entries → có "Load more" nếu có thêm.

### Tests cho User Story 5 ⚠️ VIẾT TRƯỚC — ĐẢM BẢO FAIL TRƯỚC KHI IMPLEMENT

- [X] T073 [P] [US5] Integration test activity log trong `tests/integration/activity.test.ts`
- [X] T074 [US5] E2E test US5 trong `tests/e2e/us5-activity-log.spec.ts`

### Implementation cho User Story 5

- [X] T075 [P] [US5] `GET /api/boards/[boardId]/activity` trong `src/app/api/boards/[boardId]/activity/route.ts`
- [X] T076 [P] [US5] Component `ActivityLog` tại `src/components/activity/ActivityLog.tsx`
- [X] T077 [P] [US5] Component `ActivityEntry` tại `src/components/activity/ActivityEntry.tsx`
- [X] T078 [P] [US5] Hook `useActivityLog(boardId)` trong `src/hooks/useActivity.ts`
- [X] T079 [US5] Tích hợp `ActivityLog` vào Board page — sidebar được toggle từ header

**Checkpoint**: US5 hoạt động — activity log hiển thị đúng, pagination hoạt động, tất cả 5 user stories hoàn chỉnh

- [X] T100 Redeploy sau US5 — push code, smoke test toàn bộ US1–US5 trên production URL trước khi vào phase Polish

---

## Phase 8: Polish & Cross-Cutting Concerns

**Mục đích**: Bổ sung các yêu cầu phi chức năng, bảo mật, performance, accessibility

- [X] T080 [P] Rate limiting cho auth endpoints trong `src/lib/rate-limit.ts` (in-memory, 10 req/15min/IP)
- [X] T081 [P] CORS allowlist trong `src/middleware.ts`
- [X] T082 CSP headers đã có trong `next.config.mjs`
- [ ] T083 [P] Accessibility audit với `@axe-core/react`
- [ ] T084 [P] Responsive testing
- [ ] T085 [P] Bundle size audit
- [ ] T086 N+1 query review
- [ ] T087 [P] `npm audit --audit-level=high`
- [X] T088 Test suite: 29/29 pass (`npm run test`) — E2E cần môi trường live
- [X] T089 Validate theo `quickstart.md` và kiểm tra requirement về màu nền board/column theo spec mới
- [X] T102 [P] Rà soát lại contrast, spacing và cảm giác visual của board/column trong `src/components/board/Column.tsx`, `src/components/board/ColumnList.tsx` và `src/app/globals.css`

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
