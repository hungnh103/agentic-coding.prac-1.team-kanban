import { test, expect } from "@playwright/test"

test.describe("US4: Assignment & Comments", () => {
  async function login(page: any, email: string, password: string) {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/mật khẩu/i).fill(password)
    await page.getByRole("button", { name: /đăng nhập/i }).click()
    await expect(page).toHaveURL("/")
  }

  test("assign card cho thành viên và verify avatar hiển thị", async ({ page }) => {
    await login(page, "e2e-us4@example.com", "password123")
    await page.getByText(/board/i).first().click()

    await page.getByText("Card to assign").click()
    await expect(page.getByRole("dialog")).toBeVisible()

    // Open assignee selector
    await page.getByRole("combobox", { name: /người thực hiện/i }).click()
    await page.getByRole("option").first().click()

    // Verify assignee avatar on card
    await page.getByRole("button", { name: /đóng/i }).click()
    await expect(page.getByAltText(/avatar/i).first()).toBeVisible()
  })

  test("thêm comment và verify tên tác giả + timestamp", async ({ page }) => {
    await login(page, "e2e-us4@example.com", "password123")
    await page.getByText(/board/i).first().click()

    await page.getByText("Card to comment").click()

    const commentInput = page.getByPlaceholder(/viết comment/i)
    await commentInput.fill("Comment test từ E2E")
    await page.getByRole("button", { name: /gửi/i }).click()

    await expect(page.getByText("Comment test từ E2E")).toBeVisible()
    await expect(page.getByText(/vừa xong|phút trước/i)).toBeVisible()
  })

  test("xóa comment của mình thành công", async ({ page }) => {
    await login(page, "e2e-us4@example.com", "password123")
    await page.getByText(/board/i).first().click()

    await page.getByText("Card to comment").click()

    const commentText = "Comment sẽ bị xóa"
    await page.getByPlaceholder(/viết comment/i).fill(commentText)
    await page.getByRole("button", { name: /gửi/i }).click()

    await expect(page.getByText(commentText)).toBeVisible()

    // Delete the comment
    await page.getByText(commentText).locator("..").getByRole("button", { name: /xóa/i }).click()
    await expect(page.getByText(commentText)).not.toBeVisible()
  })
})
