import { test, expect } from "@playwright/test"

test.describe("US2: Card Management", () => {
  // Assumes user is already registered from US1 tests
  const testEmail = "e2e-us2@example.com"
  const testPassword = "password123"

  async function loginAndNavigate(page: any) {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/mật khẩu/i).fill(testPassword)
    await page.getByRole("button", { name: /đăng nhập/i }).click()
    await expect(page).toHaveURL("/")
  }

  test("tạo card trong column", async ({ page }) => {
    await loginAndNavigate(page)
    await page.getByText(/board/i).first().click()

    await page.getByRole("button", { name: /thêm thẻ/i }).first().click()
    await page.getByPlaceholder(/tiêu đề thẻ/i).fill("Task đầu tiên")
    await page.keyboard.press("Enter")

    await expect(page.getByText("Task đầu tiên")).toBeVisible()
  })

  test("mở card detail", async ({ page }) => {
    await loginAndNavigate(page)
    await page.getByText(/board/i).first().click()

    await page.getByText("Task đầu tiên").click()
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("chỉnh sửa title card", async ({ page }) => {
    await loginAndNavigate(page)
    await page.getByText(/board/i).first().click()

    await page.getByText("Task đầu tiên").click()
    const titleInput = page.getByRole("textbox", { name: /tiêu đề/i })
    await titleInput.clear()
    await titleInput.fill("Task đã cập nhật")
    await page.keyboard.press("Enter")

    await expect(page.getByText("Task đã cập nhật")).toBeVisible()
  })

  test("xóa card", async ({ page }) => {
    await loginAndNavigate(page)
    await page.getByText(/board/i).first().click()

    await page.getByText("Task đã cập nhật").click()
    await page.getByRole("button", { name: /xóa thẻ/i }).click()
    await page.getByRole("button", { name: /xác nhận/i }).click()

    await expect(page.getByText("Task đã cập nhật")).not.toBeVisible()
  })
})
