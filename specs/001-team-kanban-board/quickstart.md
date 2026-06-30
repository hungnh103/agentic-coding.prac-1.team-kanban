# Quickstart Validation Guide: Team Kanban Board

**Mục đích**: Hướng dẫn chạy và validate từng user story sau khi cài đặt xong.

---

## Prerequisites

- Node.js ≥ 20.x và npm/pnpm
- Tài khoản Supabase (tạo project tại [supabase.com](https://supabase.com)) — **lấy connection strings ở Project Settings → Database**
- Tài khoản Netlify (deploy tại [netlify.com](https://netlify.com)) — optional cho local dev

## Cài đặt & Khởi động

```bash
# 1. Cài dependencies
pnpm install

# 2. Tạo file môi trường
cp .env.example .env.local
```

Chỉnh sửa `.env.local` với các giá trị từ Supabase dashboard:

```bash
# Supabase → Project Settings → Database → Connection string → Transaction mode (port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase → Project Settings → Database → Connection string → Session mode (port 5432) — dùng cho migrations
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Tạo ngẫu nhiên: openssl rand -base64 32
AUTH_SECRET="your-secret-here"

# URL ứng dụng (local dev)
AUTH_URL="http://localhost:3000"
```

> **Lưu ý Supabase Free Tier**: Database sẽ tự động **pause sau 7 ngày không hoạt động**.
> Khi bị pause, vào Supabase dashboard → Project → Resume để kích hoạt lại (thường mất ~30 giây).

```bash
# 3. Tạo database schema (dùng DIRECT_URL)
pnpm prisma migrate dev --name init

# 4. Chạy ứng dụng (development)
pnpm dev
# → http://localhost:3000
```

---

## Validate User Story 1 — Board & Column Management

**Mục tiêu**: Đăng ký, tạo board, thêm/đổi tên/xóa column.

```
1. Truy cập http://localhost:3000/register
2. Đăng ký tài khoản: email + mật khẩu + tên
   ✓ Được chuyển tới dashboard (danh sách board rỗng)

3. Click "Tạo board mới" → đặt tên "My Project"
   ✓ Board xuất hiện trên dashboard

4. Click vào board → thêm 3 columns: "To Do", "In Progress", "Done"
   ✓ Mỗi column xuất hiện ngay sau khi tạo

5. Đổi tên "To Do" thành "Backlog"
   ✓ Tên cập nhật ngay lập tức

6. Xóa column "Done" (rỗng)
   ✓ Column bị xóa, 2 column còn lại hiển thị

7. Thêm card vào "Backlog", rồi thử xóa column "Backlog"
   ✓ Hiện warning "Column có cards. Xác nhận xóa?"
   ✓ Sau khi xác nhận → column và card bị xóa
```

**Test tự động** (acceptance scenarios): `pnpm test tests/e2e/us1-board-column.spec.ts`

---

## Validate User Story 2 — Card Management

**Mục tiêu**: Tạo, sửa, xem chi tiết, xóa card.

```
1. Trên board có ít nhất 1 column → click "Add card" → nhập title "Implement login"
   ✓ Card xuất hiện ở cuối column

2. Click vào card → xem Card Detail
   ✓ Hiển thị title, description (rỗng), assignee (rỗng), comments (rỗng)

3. Sửa title thành "Implement authentication"
   ✓ Title mới phản ánh ngay trên board

4. Thêm description dài (> 100 ký tự)
   ✓ Preview trên board bị truncate; full text hiển thị trong Card Detail

5. Xóa card
   ✓ Card biến mất khỏi column, các card khác không bị ảnh hưởng
```

**Test tự động**: `pnpm test tests/e2e/us2-card-management.spec.ts`

---

## Validate User Story 3 — Drag-and-Drop

**Mục tiêu**: Kéo thả card giữa columns, reorder, lưu trạng thái.

```
1. Tạo 2 columns: "To Do" (2 cards: A, B) và "In Progress"
2. Drag card A từ "To Do" sang "In Progress"
   ✓ Card A xuất hiện trong "In Progress" ngay lập tức

3. Refresh trang
   ✓ Card A vẫn trong "In Progress" (đã lưu)

4. Reorder: drag card B lên trên card ở đầu "To Do"
   ✓ Thứ tự mới được lưu sau refresh

5. Kiểm tra trên mobile (Chrome DevTools → 375px width)
   ✓ Touch drag hoạt động bình thường

6. Drag card ra ngoài bất kỳ column nào
   ✓ Card quay về vị trí ban đầu
```

**Test tự động**: `pnpm test tests/e2e/us3-drag-drop.spec.ts`

---

## Validate User Story 4 — Assignment & Comments

**Mục tiêu**: Mời thành viên, assign card, thêm comment.

```
1. Mời user thứ 2 vào board (cần tài khoản thứ 2)
   ✓ User thứ 2 thấy board trong dashboard của họ

2. Mở card → chọn assignee từ danh sách thành viên → chọn user 2
   ✓ Avatar/tên user 2 hiển thị trên card preview và Card Detail

3. User 1 thêm comment: "Cần review trước thứ 6"
   ✓ Comment xuất hiện với tên User 1 và timestamp

4. User 2 (đăng nhập) thêm comment: "Đã nhận task"
   ✓ Comment mới xuất hiện chronologically sau comment User 1

5. User 1 xóa comment của mình
   ✓ Comment bị xóa

6. User 1 thử xóa comment của User 2
   ✓ Không thể xóa / nút xóa không hiển thị
```

**Test tự động**: `pnpm test tests/e2e/us4-assignment-comments.spec.ts`

---

## Validate User Story 5 — Activity Log

**Mục đích**: Kiểm tra activity log ghi nhận đúng các sự kiện.

```
1. Thực hiện các hành động sau trên board:
   - Tạo card "Task X" trong column "To Do"
   - Move card "Task X" sang "In Progress"
   - Add comment "Starting work"

2. Mở Activity Log của board
   ✓ Hiển thị danh sách sự kiện mới nhất đầu tiên (reverse-chronological)
   ✓ "Starting work" comment entry hiển thị: ai comment, trên card nào
   ✓ Move entry hiển thị: ai move, từ column nào, sang column nào, khi nào

3. Kiểm tra phân trang: nếu có > 20 entries → nút "Load more" hoặc pagination
   ✓ Không load tất cả cùng lúc
```

**Test tự động**: `pnpm test tests/e2e/us5-activity-log.spec.ts`

---

## Validate Accessibility (Constitution III)

```bash
# Chạy axe-core audit trên các trang chính
pnpm test tests/unit/a11y.test.ts

# Kiểm tra thủ công (keyboard navigation)
- Tab qua tất cả interactive elements trên board view
  ✓ Focus indicator rõ ràng trên mọi element
- Screen reader: ARIA labels đúng trên icon-only buttons
```

---

## Chạy tất cả tests

```bash
# Unit + Integration tests
pnpm test

# E2E tests (cần app đang chạy trên port 3000)
pnpm test:e2e

# Coverage report (target: ≥ 80%)
pnpm test:coverage

# Lighthouse performance audit
pnpm dlx lighthouse http://localhost:3000 --only-categories=performance,accessibility
```

---

## Deploy lên Netlify + Supabase

```bash
# 1. Đảm bảo netlify.toml ở root đã đúng cấu hình:
#    command = "npx prisma generate && next build"
#    plugins: @netlify/plugin-nextjs

# 2. Chạy migration production (dùng DIRECT_URL)
DATABASE_URL=$DIRECT_URL pnpm prisma migrate deploy

# 3. Push lên Git → Netlify tự động deploy
git push origin main
```

**Set environment variables trên Netlify dashboard** (Site settings → Environment variables):
- `DATABASE_URL` — Supabase Pooler URL (port 6543, `?pgbouncer=true`)
- `DIRECT_URL` — Supabase Direct URL (port 5432)
- `AUTH_SECRET` — chuỗi random ≥ 32 ký tự
- `AUTH_URL` — URL Netlify deploy (VD: `https://your-app.netlify.app`)

> **Lưu ý Netlify Free Tier**: Serverless functions có timeout **10 giây**.
> Nếu API route chạy quá 10s → lỗi 504. Kiểm tra bằng Netlify Function logs.

---

## Tham khảo thêm

- Data model: [data-model.md](./data-model.md)
- API contracts: [contracts/api.md](./contracts/api.md)
- Feature spec: [spec.md](./spec.md)
