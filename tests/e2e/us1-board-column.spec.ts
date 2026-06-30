import { test, expect } from "@playwright/test"

test.describe("US1: Board & Column Management", () => {
  const testUser = {
    name: "Test User E2E",
    email: `e2e-us1-${Date.now()}@example.com`,
    password: "password123",
  }

  test("đăng ký tài khoản mới", async ({ page }) => {
    await page.goto("/register")
    await page.getByLabel(/tên/i).fill(testUser.name)
    await page.getByLabel(/email/i).fill(testUser.email)
    await page.getByLabel(/mật khẩu/i).fill(testUser.password)
    await page.getByRole("button", { name: /đăng ký/i }).click()
    await expect(page).toHaveURL("/login")
  })

  test("đăng nhập sau khi đăng ký", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(testUser.email)
    await page.getByLabel(/mật khẩu/i).fill(testUser.password)
    await page.getByRole("button", { name: /đăng nhập/i }).click()
    await expect(page).toHaveURL("/")
  })

  test("tạo board mới", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(testUser.email)
    await page.getByLabel(/mật khẩu/i).fill(testUser.password)
    await page.getByRole("button", { name: /đăng nhập/i }).click()
    await expect(page).toHaveURL("/")

    await page.getByRole("button", { name: /tạo board/i }).click()
    await page.getByLabel(/tên board/i).fill("My Test Board")
    await page.getByRole("button", { name: /tạo/i }).click()

    await expect(page.getByText("My Test Board")).toBeVisible()
  })

  test("thêm 3 columns vào board", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(testUser.email)
    await page.getByLabel(/mật khẩu/i).fill(testUser.password)
    await page.getByRole("button", { name: /đăng nhập/i }).click()

    await page.getByText("My Test Board").click()

    // Add columns
    for (const name of ["To Do", "In Progress", "Done"]) {
      await page.getByRole("button", { name: /thêm cột/i }).click()
      await page.getByPlaceholder(/tên cột/i).fill(name)
      await page.keyboard.press("Enter")
      await expect(page.getByText(name)).toBeVisible()
    }
  })

  test("đổi tên column", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(testUser.email)
    await page.getByLabel(/mật khẩu/i).fill(testUser.password)
    await page.getByRole("button", { name: /đăng nhập/i }).click()

    await page.getByText("My Test Board").click()

    // Double-click to rename
    await page.getByText("To Do").dblclick()
    await page.keyboard.selectAll()
    await page.keyboard.type("Backlog")
    await page.keyboard.press("Enter")

    await expect(page.getByText("Backlog")).toBeVisible()
  })

  test("xóa column rỗng", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(testUser.email)
    await page.getByLabel(/mật khẩu/i).fill(testUser.password)
    await page.getByRole("button", { name: /đăng nhập/i }).click()

    await page.getByText("My Test Board").click()

    // Delete Done column
    await page.getByText("Done").hover()
    await page.getByRole("button", { name: /xóa cột/i }).click()
    await page.getByRole("button", { name: /xác nhận/i }).click()

    await expect(page.getByText("Done")).not.toBeVisible()
  })
})
