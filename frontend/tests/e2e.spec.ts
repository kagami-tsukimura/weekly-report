import { expect, test } from "@playwright/test";

const TEST_USER = {
	username: "testuser",
	password: "password",
};

// ユニークなテスト識別子を生成
const TEST_ID = Date.now().toString();

test.describe("Weekly Report App E2E", () => {
	// ログイン処理 (Credentials Provider経由)
	test.beforeEach(async ({ page }) => {
		await page.goto("/login");

		await expect(
			page.locator('button:has-text("Sign in with Credentials")'),
		).toBeVisible({ timeout: 10000 });

		await page.fill('input[name="username"]', TEST_USER.username);
		await page.fill('input[name="password"]', TEST_USER.password);
		await page.click('button:has-text("Sign in with Credentials")');

		await expect(page).toHaveURL("/", { timeout: 10000 });
		await expect(page.locator("text=Weekly Report")).toBeVisible({
			timeout: 10000,
		});
	});

	test("Create a new report", async ({ page }) => {
		const testContent = `E2E Create ${TEST_ID}`;

		await page.fill('input[name="week_start"]', "2025-01-01");
		await page.fill('input[name="learning_hours"]', "5.0");
		await page.fill('textarea[name="done"]', testContent);
		await page.fill('textarea[name="todo"]', "E2E Test Todo");
		await page.click('button:has-text("Submit Report")');

		// 作成確認
		await expect(page.locator(`text=${testContent}`).first()).toBeVisible({
			timeout: 10000,
		});
	});

	test("Update a report", async ({ page }) => {
		// まず作成
		const originalContent = `E2E Update Original ${TEST_ID}`;
		const updatedContent = `E2E Update Done ${TEST_ID}`;

		await page.fill('input[name="week_start"]', "2025-01-02");
		await page.fill('input[name="learning_hours"]', "3.0");
		await page.fill('textarea[name="done"]', originalContent);
		await page.fill('textarea[name="todo"]', "Update test");
		await page.click('button:has-text("Submit Report")');

		// 作成確認
		await expect(page.locator(`text=${originalContent}`).first()).toBeVisible({
			timeout: 10000,
		});

		// 編集
		const reportCard = page
			.locator("div.border")
			.filter({ hasText: originalContent })
			.first();

		await reportCard.hover();
		await reportCard.locator('button:has-text("Edit")').click();

		// モーダルを取得
		const modal = page.locator(".fixed.inset-0");
		await expect(modal.locator("text=Edit Report")).toBeVisible();

		// モーダル内のフォームを操作
		await modal.locator('textarea[name="done"]').fill(updatedContent);
		await modal.locator('button:has-text("Update Report")').click();

		// モーダルが閉じるのを待つ
		await expect(page.locator("text=Edit Report")).not.toBeVisible({
			timeout: 10000,
		});

		// 更新確認
		await expect(page.locator(`text=${updatedContent}`).first()).toBeVisible({
			timeout: 10000,
		});
	});

	test("Delete a report", async ({ page }) => {
		// まず作成
		const testContent = `E2E Delete ${TEST_ID}`;

		await page.fill('input[name="week_start"]', "2025-01-03");
		await page.fill('input[name="learning_hours"]', "2.0");
		await page.fill('textarea[name="done"]', testContent);
		await page.fill('textarea[name="todo"]', "Delete test");
		await page.click('button:has-text("Submit Report")');

		// 作成確認
		await expect(page.locator(`text=${testContent}`).first()).toBeVisible({
			timeout: 10000,
		});

		// 削除
		const reportCard = page
			.locator("div.border")
			.filter({ hasText: testContent })
			.first();

		await reportCard.hover();

		page.on("dialog", (dialog) => dialog.accept());

		await reportCard.locator('button:has-text("Delete")').click();

		// 削除確認
		await expect(page.locator(`text=${testContent}`)).not.toBeVisible({
			timeout: 10000,
		});
	});
});
