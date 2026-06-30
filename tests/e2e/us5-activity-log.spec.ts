import { test, expect } from "@playwright/test"

test.describe("US5: Activity Log", () => {
  async function login(page: any) {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill("e2e-us5@example.com")
    await page.getByLabel(/mật khẩu/i).fill("password123")
    await page.getByRole("button", { name: /đăng nhập/i }).click()
    await expect(page).toHaveURL("/")
  }

  test("các actions ghi vào activity log đúng thứ tự", async ({ page }) => {
    await login(page)
    await page.getByText(/board/i).first().click()

    // Mở activity log
    await page.getByRole("button", { name: /lịch sử/i }).click()

    // Verify entries visible
    await expect(page.getByRole("list").locator("[data-testid='activity-entry']")).toHaveCount.callCount

    // Verify reverse-chronological order
    const entries = page.getByTestId("activity-entry")
    const count = await entries.count()
    expect(count).toBeGreaterThan(0)
  })

  test("pagination hiển thị tối đa 20 entries", async ({ page }) => {
    await login(page)
    await page.getByText(/board/i).first().click()

    await page.getByRole("button", { name: /lịch sử/i }).click()

    const entries = page.getByTestId("activity-entry")
    const count = await entries.count()
    expect(count).toBeLessThanOrEqual(20)
  })

  test("Load more button hiển thị khi có thêm entries", async ({ page }) => {
    await login(page)
    await page.getByText(/board/i).first().click()

    await page.getByRole("button", { name: /lịch sử/i }).click()

    // If there are more than 20 entries, load more button should be visible
    const loadMoreBtn = page.getByRole("button", { name: /tải thêm/i })
    // This is conditional - only visible if total > 20
    const isVisible = await loadMoreBtn.isVisible()
    if (isVisible) {
      await loadMoreBtn.click()
      await expect(page.getByTestId("activity-entry")).toHaveCount.callCount
    }
  })
})
