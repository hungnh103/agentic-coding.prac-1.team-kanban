# API Contracts: Team Kanban Board

**Base URL**: `/api` | **Auth**: Session cookie (httpOnly) via Auth.js | **Format**: JSON

> Tất cả endpoints yêu cầu authentication trừ `/api/auth/**`
> Authorization: mọi thao tác trên board/column/card đều kiểm tra `BoardMember` membership trước khi xử lý
> Response lỗi chuẩn: `{ "error": "message" }` với HTTP status tương ứng

---

## Authentication — `/api/auth/**`

Được xử lý bởi Auth.js (NextAuth.js v5). Các endpoint mặc định:

| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/auth/signin` | Đăng nhập (credentials / OAuth) |
| `POST` | `/api/auth/signout` | Đăng xuất, xóa session cookie |
| `GET` | `/api/auth/session` | Lấy session hiện tại |

**Đăng ký tài khoản** (custom endpoint):

```
POST /api/auth/register
Body: { "email": string, "password": string, "name": string }
Response 201: { "id": string, "email": string, "name": string }
Response 400: { "error": "Email đã tồn tại" | "Dữ liệu không hợp lệ" }
```

---

## Boards — `/api/boards`

### Lấy danh sách boards của user

```
GET /api/boards
Response 200: Board[]
```

### Tạo board mới

```
POST /api/boards
Body: { "name": string, "description"?: string }
Response 201: Board (kèm columns: [])
Response 400: { "error": "..." }
```

### Lấy chi tiết board (kèm columns và cards)

```
GET /api/boards/:boardId
Response 200: Board & {
  columns: (Column & { cards: Card[] })[],
  members: (BoardMember & { user: Pick<User, "id"|"name"|"avatarUrl"> })[]
}
Response 403: { "error": "Không có quyền truy cập" }
Response 404: { "error": "Board không tồn tại" }
```

### Mời thành viên vào board

```
POST /api/boards/:boardId/members
Body: { "email": string }
Response 201: BoardMember & { user: Pick<User, "id"|"name"|"avatarUrl"> }
Response 400: { "error": "User không tồn tại" | "Đã là thành viên" }
Response 403: { "error": "Chỉ OWNER mới có thể mời thành viên" }
```

---

## Columns — `/api/boards/:boardId/columns`

### Tạo column

```
POST /api/boards/:boardId/columns
Body: { "name": string }
Response 201: Column
Response 400: { "error": "..." }
Response 403: { "error": "Không có quyền" }
```

### Cập nhật column (tên hoặc thứ tự)

```
PATCH /api/boards/:boardId/columns/:columnId
Body: { "name"?: string, "order"?: number }
Response 200: Column
```

### Xóa column

```
DELETE /api/boards/:boardId/columns/:columnId
Query: { "confirm"?: "true" }  ← bắt buộc nếu column có cards
Response 204: (no content)
Response 409: { "error": "Column có cards. Gửi ?confirm=true để xác nhận xóa" }
```

---

## Cards — `/api/boards/:boardId/cards`

### Tạo card

```
POST /api/boards/:boardId/cards
Body: { "columnId": string, "title": string }
Response 201: Card
Response 400: { "error": "..." }
```

### Lấy chi tiết card

```
GET /api/boards/:boardId/cards/:cardId
Response 200: Card & {
  assignee: Pick<User, "id"|"name"|"avatarUrl"> | null,
  comments: (Comment & { author: Pick<User, "id"|"name"|"avatarUrl"> })[]
}
```

### Cập nhật card (title, description, assignee)

```
PATCH /api/boards/:boardId/cards/:cardId
Body: { "title"?: string, "description"?: string, "assigneeId"?: string | null }
Response 200: Card
```

### Di chuyển card (drag-and-drop)

```
PATCH /api/boards/:boardId/cards/:cardId/move
Body: { "columnId": string, "order": number }
Response 200: Card
```

### Xóa card

```
DELETE /api/boards/:boardId/cards/:cardId
Response 204: (no content)
```

---

## Comments — `/api/boards/:boardId/cards/:cardId/comments`

### Thêm comment

```
POST /api/boards/:boardId/cards/:cardId/comments
Body: { "content": string }
Response 201: Comment & { author: Pick<User, "id"|"name"|"avatarUrl"> }
```

### Xóa comment

```
DELETE /api/boards/:boardId/cards/:cardId/comments/:commentId
Response 204: (no content)
Response 403: { "error": "Chỉ tác giả mới được xóa comment" }
```

---

## Activity Log — `/api/boards/:boardId/activity`

### Lấy activity log của board

```
GET /api/boards/:boardId/activity?page=1&pageSize=20
Response 200: {
  items: (ActivityLog & { actor: Pick<User, "id"|"name"|"avatarUrl"> })[],
  total: number,
  page: number,
  pageSize: number,
  hasMore: boolean
}
```

---

## HTTP Status Codes

| Code | Ý nghĩa |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (chưa đăng nhập) |
| 403 | Forbidden (không có quyền) |
| 404 | Not Found |
| 409 | Conflict (VD: xóa column có cards chưa confirm) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |
