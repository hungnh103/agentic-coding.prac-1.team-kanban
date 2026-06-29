# Feature Specification: Team Kanban Board

**Feature Branch**: `001-team-kanban-board`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "Xây dựng ứng dụng kanban board dành cho nhóm người dùng nhỏ. Người dùng có thể tạo board, column, card (hay còn gọi là task, đây là đơn vị nhỏ nhất trong kanban board), có thể kéo-thả để di chuyển card từ column này sang column khác, có thể comment vào card và assign người phụ trách card. Ngoài ra kanban board sẽ có activity log cơ bản. Giao diện thân thiện, hiện đại, có hỗ trợ responsive cho mobile, tablet, PC."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Board & Column Management (Priority: P1)

A user registers an account and creates a new Kanban board for their team. They set up columns representing workflow stages (e.g., "To Do", "In Progress", "Done"). They can rename, reorder, and delete columns as the workflow evolves.

**Why this priority**: A board with at least one column is the minimum viable surface — nothing else in the application is usable without it. This story validates the entire structural foundation.

**Independent Test**: Can be fully tested by registering an account, creating a board with three columns, renaming one column, reordering the columns, then deleting one — all delivered as a complete, demonstrable workflow.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they register with a valid email and password, **Then** they are logged in and see an empty dashboard.
2. **Given** a logged-in user with no boards, **When** they create a new board and provide a name, **Then** the board appears on their dashboard.
3. **Given** a board with no columns, **When** the user adds a column with a name, **Then** the column appears in the board view.
4. **Given** a board with multiple columns, **When** the user renames a column, **Then** the updated name is reflected immediately in the board.
5. **Given** a board with multiple columns, **When** the user deletes an empty column, **Then** the column is removed and the remaining columns reorder.
6. **Given** a column with existing cards, **When** the user attempts to delete it, **Then** the system warns that cards will be lost and requires explicit confirmation before deleting.

---

### User Story 2 — Card (Task) Management (Priority: P2)

A team member creates a card inside a column to represent a task. They can open the card to view its details, edit the title and description, and delete it when the task is complete or no longer relevant.

**Why this priority**: Cards are the atomic unit of work in a Kanban board. Without card management, teams have no way to track individual tasks.

**Independent Test**: Can be fully tested by creating a card in a column, editing its title and description, then deleting it — demonstrating full CRUD for the primary entity.

**Acceptance Scenarios**:

1. **Given** a board with at least one column, **When** the user clicks "Add card" and enters a title, **Then** the card appears at the bottom of the column.
2. **Given** an existing card, **When** the user opens it, **Then** a detail view shows the title, description, assignee, and comments.
3. **Given** an open card detail, **When** the user edits the title and saves, **Then** the new title is reflected on the board immediately.
4. **Given** an existing card, **When** the user deletes it, **Then** it is removed from the column and the board without affecting other cards.
5. **Given** a card with a long description, **When** the board view is rendered, **Then** the description is truncated in the card preview but fully visible inside the card detail.

---

### User Story 3 — Drag-and-Drop Card Movement (Priority: P3)

A user drags a card from one column to another (or reorders cards within the same column) to reflect the current state of a task. The change is saved immediately and reflected to all team members viewing the board.

**Why this priority**: Drag-and-drop is the signature interaction of a Kanban board. It enables rapid workflow management without opening menus, directly fulfilling the core value proposition.

**Independent Test**: Can be tested by dragging a card from "To Do" to "In Progress" and verifying the card persists in the new column after page refresh.

**Acceptance Scenarios**:

1. **Given** a board with multiple columns and cards, **When** the user drags a card to a different column, **Then** the card appears in the target column in the position it was dropped.
2. **Given** a card dropped in a column, **When** the page is refreshed, **Then** the card remains in the target column (change is persisted).
3. **Given** multiple cards in a column, **When** the user drags one card to reorder it within the same column, **Then** the new order is saved.
4. **Given** a mobile or touch device, **When** the user performs a touch-drag gesture on a card, **Then** the card moves to the target column as expected.
5. **Given** a drag operation in progress, **When** the user drops the card outside any valid column, **Then** the card returns to its original position with no state change.

---

### User Story 4 — Card Assignment & Comments (Priority: P4)

A team lead opens a card and assigns it to a specific team member. Team members can leave comments on a card to discuss the task, ask questions, or provide updates. The assignee and commenter are identified by their display name.

**Why this priority**: Assignment and discussion are critical for team coordination. Without them, users cannot communicate context within the board itself and must rely on external tools.

**Independent Test**: Can be tested by inviting a second user to a board, assigning a card to them, and posting a comment — demonstrating team collaboration on a single card.

**Acceptance Scenarios**:

1. **Given** a board with at least one other member, **When** a user opens a card and selects an assignee from the member list, **Then** the assignee's name or avatar is displayed on the card.
2. **Given** a card with an assignee, **When** the assignee is viewed in the member list, **Then** they show as assigned to that card.
3. **Given** an open card, **When** a user types a comment and submits, **Then** the comment appears in the card's comment list with the author's name and a timestamp.
4. **Given** a card with multiple comments, **When** another user adds a comment, **Then** it appears chronologically after the existing comments.
5. **Given** a comment the current user authored, **When** they delete it, **Then** the comment is removed. Users cannot delete other users' comments.

---

### User Story 5 — Activity Log (Priority: P5)

A team member opens the activity log for a board to see a chronological list of recent events: cards created, moved, assigned, commented on, and columns added or removed. This gives visibility into team activity without requiring real-time presence.

**Why this priority**: The activity log provides accountability and context without requiring team members to be simultaneously online. It is the lowest-risk addition since it requires no new interactions — only recording actions already captured by other stories.

**Independent Test**: Can be tested by performing a series of actions on a board (create card, move it, add comment) and verifying each action appears as an entry in the activity log.

**Acceptance Scenarios**:

1. **Given** a board with recent activity, **When** a user opens the activity log, **Then** they see a list of events in reverse-chronological order (newest first).
2. **Given** an activity log entry for a card move, **When** displayed, **Then** it shows: who moved it, from which column, to which column, and when.
3. **Given** an activity log entry for a comment, **When** displayed, **Then** it shows: who commented and on which card.
4. **Given** a board with no activity, **When** the activity log is opened, **Then** an empty state message is displayed.
5. **Given** a long activity log, **When** rendered, **Then** it is paginated or supports infinite scroll — no single page loads the full history unbounded.

---

### Edge Cases

- What happens when a user tries to create a column with an empty or whitespace-only name? → System rejects and shows a validation message.
- What happens when a user tries to create a card with an empty title? → System prevents submission and highlights the required field.
- What happens when a board has no columns and a user tries to add a card? → No card creation UI is visible; user is prompted to add a column first.
- What happens if a team has reached a maximum of 20 members and another is invited? → System rejects the invitation and explains the team size limit.
- What happens when two users simultaneously reorder the same column? → Last write wins; the final state is persisted and both users see the same result after their next interaction.
- What happens when a user loses connectivity mid-drag? → The drag is cancelled, the card returns to its original position, and the user is notified of the connectivity issue.

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Identity**

- **FR-001**: System MUST allow users to register with a unique email address and a password.
- **FR-002**: System MUST allow registered users to log in and log out.
- **FR-003**: System MUST maintain authenticated sessions so users do not need to log in on every visit within the session lifetime.

**Board Management**

- **FR-004**: Authenticated users MUST be able to create a named board.
- **FR-005**: Board owners MUST be able to rename and delete their board.
- **FR-006**: Board owners MUST be able to invite other registered users to join a board (up to 20 members per board).
- **FR-007**: Board members MUST see the board in their dashboard.

**Column Management**

- **FR-008**: Board members MUST be able to add a named column to a board.
- **FR-009**: Board members MUST be able to rename an existing column.
- **FR-010**: Board members MUST be able to delete a column (with confirmation if it contains cards).
- **FR-011**: Board members MUST be able to reorder columns via drag-and-drop.

**Card Management**

- **FR-012**: Board members MUST be able to create a card with at least a title inside any column.
- **FR-013**: Board members MUST be able to edit the title and description of any card.
- **FR-014**: Board members MUST be able to delete any card.
- **FR-015**: Cards MUST support a plain-text description field.

**Drag-and-Drop**

- **FR-016**: Board members MUST be able to move a card to a different column by dragging and dropping.
- **FR-017**: Board members MUST be able to reorder cards within the same column by dragging.
- **FR-018**: Drag-and-drop MUST work via touch input on mobile and tablet devices.
- **FR-019**: All card position changes MUST be persisted immediately after a drop.

**Assignment**

- **FR-020**: Board members MUST be able to assign a card to any member of the same board.
- **FR-021**: A card may have at most one assignee at a time.
- **FR-022**: The assignee's name or avatar MUST be visible on the card in board view.

**Comments**

- **FR-023**: Board members MUST be able to post a plain-text comment on any card.
- **FR-024**: Comments MUST display the author's name and a timestamp.
- **FR-025**: Users MUST be able to delete their own comments; they MUST NOT be able to delete others' comments.

**Activity Log**

- **FR-026**: System MUST record an activity entry whenever: a card is created, moved, or deleted; a column is created or deleted; an assignment is added or changed; a comment is posted.
- **FR-027**: Board members MUST be able to view the activity log for any board they are a member of, displayed in reverse-chronological order.
- **FR-028**: Activity log MUST be paginated; it MUST NOT load the full history in a single request.

**Responsive UI**

- **FR-029**: All screens MUST be usable at mobile (375 px), tablet (768 px), and desktop (1280 px) widths.
- **FR-030**: Board view on mobile MUST allow horizontal scrolling between columns.

### Key Entities

- **User**: A registered individual. Attributes: unique email, display name, hashed password, avatar (optional).
- **Board**: A workspace owned by a User. Attributes: name, owner, list of member Users.
- **Column**: An ordered stage within a Board. Attributes: name, position index, parent Board.
- **Card**: The atomic task unit within a Column. Attributes: title, description (optional), position index, parent Column, optional Assignee (User).
- **Comment**: A text note attached to a Card. Attributes: body text, author (User), timestamp.
- **ActivityEntry**: An immutable record of a board event. Attributes: actor (User), event type, affected entity reference, timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can register, create a board, add three columns, and create their first card in under 3 minutes.
- **SC-002**: Dragging and dropping a card between columns produces visible feedback (card in transit) within 100 ms of the drag starting.
- **SC-003**: Board view with up to 5 columns and 20 cards per column loads completely in under 2.5 seconds on a standard broadband connection.
- **SC-004**: All primary actions (create board, create card, move card, add comment) complete without a full page reload.
- **SC-005**: Touch drag-and-drop on mobile successfully moves cards in ≥ 95% of test attempts across supported mobile screen sizes.
- **SC-006**: The activity log for a board with 1,000 entries renders the first page in under 1 second.
- **SC-007**: All interactive elements (buttons, inputs, modals) are accessible via keyboard navigation and screen reader without loss of functionality.

---

## Assumptions

- **Team size**: A "small group" is assumed to be ≤ 20 members per board. This governs limits on the invitation feature and performance targets.
- **Authentication**: Email and password authentication is sufficient for v1. Social login (Google, GitHub, etc.) is out of scope.
- **Real-time collaboration**: Live cursor sharing or real-time card updates across multiple browser sessions are out of scope. Changes made by others are visible after the page is refreshed.
- **Card due dates and labels**: Not requested in the feature description; deferred to a future iteration.
- **File attachments on cards**: Not in scope for v1.
- **Board visibility**: All boards are private by default and accessible only to invited members. No public boards.
- **Mobile drag-and-drop**: Touch drag-and-drop must be supported but may use a dedicated touch event library; native HTML5 drag-and-drop (which has poor mobile support) is not assumed.
- **Data retention**: User and board data is retained indefinitely unless the user explicitly deletes their account or board.
- **Notification system**: Email or push notifications for assignments and comments are out of scope for v1. The activity log serves as the primary awareness mechanism.
