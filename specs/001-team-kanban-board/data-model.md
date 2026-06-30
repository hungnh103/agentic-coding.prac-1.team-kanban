# Data Model: Team Kanban Board

**Branch**: `001-team-kanban-board` | **ORM**: Prisma | **Database**: PostgreSQL

---

## Entity Diagram

```
User
 ├──< Board (nhiều board, owner)
 ├──< BoardMember (nhiều board tham gia)
 ├──< Card.assignee (được assign vào card)
 ├──< Comment (tác giả comment)
 └──< ActivityLog (actor)

Board
 ├──< Column (có thứ tự - order)
 ├──< BoardMember (thành viên)
 └──< ActivityLog

Column
 └──< Card (có thứ tự - order)

Card
 ├──< Comment
 └──< ActivityLog (liên quan đến card)
```

---

## Entities

### User

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `String` | PK, cuid() | Unique identifier |
| `email` | `String` | UNIQUE, NOT NULL | Email đăng nhập |
| `name` | `String` | NOT NULL | Tên hiển thị |
| `passwordHash` | `String?` | nullable | Hash mật khẩu (null nếu OAuth) |
| `avatarUrl` | `String?` | nullable | URL ảnh đại diện |
| `createdAt` | `DateTime` | default(now()) | Thời điểm tạo |
| `updatedAt` | `DateTime` | updatedAt | Cập nhật tự động |

**Validation**:
- `email`: định dạng email hợp lệ, bắt buộc khi đăng ký
- `name`: 1–100 ký tự, không chứa ký tự điều khiển
- `passwordHash`: bcrypt, cost factor ≥ 12

---

### Board

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `String` | PK, cuid() | Unique identifier |
| `name` | `String` | NOT NULL | Tên board |
| `description` | `String?` | nullable | Mô tả |
| `ownerId` | `String` | FK → User | Người tạo/sở hữu |
| `createdAt` | `DateTime` | default(now()) | |
| `updatedAt` | `DateTime` | updatedAt | |

**Validation**:
- `name`: 1–100 ký tự, bắt buộc

**Quan hệ**:
- `owner`: User (N:1)
- `members`: BoardMember[] (1:N)
- `columns`: Column[] (1:N, có thứ tự)
- `activityLogs`: ActivityLog[] (1:N)

---

### BoardMember

Bảng trung gian quản lý thành viên của board.

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `String` | PK, cuid() | |
| `boardId` | `String` | FK → Board | |
| `userId` | `String` | FK → User | |
| `role` | `BoardRole` | default(MEMBER) | OWNER \| MEMBER |
| `joinedAt` | `DateTime` | default(now()) | |

**Constraint**: UNIQUE(boardId, userId) — mỗi người chỉ là thành viên một lần trên mỗi board.

**Enum BoardRole**: `OWNER`, `MEMBER`

---

### Column

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `String` | PK, cuid() | |
| `boardId` | `String` | FK → Board | |
| `name` | `String` | NOT NULL | Tên column (VD: "To Do") |
| `order` | `Float` | NOT NULL | Thứ tự hiển thị (fractional indexing) |
| `createdAt` | `DateTime` | default(now()) | |
| `updatedAt` | `DateTime` | updatedAt | |

**Validation**:
- `name`: 1–100 ký tự
- `order`: float dương, dùng để reorder hiệu quả (giá trị mặc định: 1, 2, 3... × 1000)

**Quan hệ**:
- `board`: Board (N:1)
- `cards`: Card[] (1:N, có thứ tự)

---

### Card

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `String` | PK, cuid() | |
| `columnId` | `String` | FK → Column | Column hiện tại |
| `boardId` | `String` | FK → Board | Để truy vấn nhanh |
| `title` | `String` | NOT NULL | Tiêu đề card |
| `description` | `String?` | nullable | Mô tả chi tiết (Markdown) |
| `assigneeId` | `String?` | FK → User, nullable | Người được assign |
| `order` | `Float` | NOT NULL | Thứ tự trong column (fractional indexing) |
| `createdAt` | `DateTime` | default(now()) | |
| `updatedAt` | `DateTime` | updatedAt | |

**Validation**:
- `title`: 1–200 ký tự, bắt buộc
- `description`: tối đa 10.000 ký tự
- `assigneeId`: nếu có, phải là thành viên của board chứa card này

**Quan hệ**:
- `column`: Column (N:1)
- `board`: Board (N:1)
- `assignee`: User? (N:1, optional)
- `comments`: Comment[] (1:N)
- `activityLogs`: ActivityLog[] (1:N)

---

### Comment

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `String` | PK, cuid() | |
| `cardId` | `String` | FK → Card | |
| `authorId` | `String` | FK → User | Tác giả |
| `content` | `String` | NOT NULL | Nội dung comment |
| `createdAt` | `DateTime` | default(now()) | |
| `updatedAt` | `DateTime` | updatedAt | |

**Validation**:
- `content`: 1–2.000 ký tự, bắt buộc

**Authorization**: Chỉ `authorId` mới được xóa comment của mình (US4, Scenario 5).

---

### ActivityLog

| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `String` | PK, cuid() | |
| `boardId` | `String` | FK → Board | |
| `actorId` | `String` | FK → User | Người thực hiện hành động |
| `action` | `ActivityAction` | NOT NULL | Loại hành động |
| `entityType` | `String` | NOT NULL | "card", "column", "board", "comment" |
| `entityId` | `String` | NOT NULL | ID của entity bị ảnh hưởng |
| `metadata` | `Json?` | nullable | Dữ liệu bổ sung (VD: {from, to} cho card move) |
| `createdAt` | `DateTime` | default(now()) | |

**Enum ActivityAction**:
```
BOARD_CREATED
COLUMN_CREATED | COLUMN_RENAMED | COLUMN_DELETED | COLUMN_REORDERED
CARD_CREATED | CARD_UPDATED | CARD_MOVED | CARD_DELETED
CARD_ASSIGNED | CARD_UNASSIGNED
COMMENT_ADDED | COMMENT_DELETED
MEMBER_ADDED
```

**Metadata examples**:
- `CARD_MOVED`: `{ "fromColumnId": "...", "fromColumnName": "To Do", "toColumnId": "...", "toColumnName": "In Progress" }`
- `COLUMN_RENAMED`: `{ "oldName": "Todo", "newName": "To Do" }`

**Lưu ý**: ActivityLog chỉ được ghi, không được sửa hay xóa. Paginate khi hiển thị (page size = 20).

---

## State Transitions

### Card Movement (drag-and-drop)

```
[columnId: A, order: 1000] → (drag) → [columnId: B, order: 1500]
```

- Update `card.columnId` và `card.order` trong cùng một transaction
- Tạo `ActivityLog` với `action: CARD_MOVED` trong cùng transaction
- Dùng fractional indexing: giá trị mới = trung bình của 2 card lân cận
  - Ví dụ: order của card trên là 1000, card dưới là 2000 → card mới = 1500
  - Khi giá trị quá nhỏ (< 0.001) → normalize lại toàn bộ orders trong column

### Column Reorder

Tương tự Card Movement, cập nhật `column.order` bằng fractional indexing.
