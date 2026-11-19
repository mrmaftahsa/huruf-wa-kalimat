import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function chooseLetters(page: Page, letters: string) {
  const bank = page.locator('.letter-bank')
  for (const letter of letters) {
    await bank.getByRole('button', { name: letter, exact: true }).click()
  }
}

const submitAnswer = (page: Page) => page.getByRole('button', { name: 'تحقّق من الإجابة' }).click()
const openClue = (page: Page) => page.getByRole('link', { name: 'حلّ الكلمة' }).click()

test('plays a level from the home screen and keeps clues and rewards after reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'حروف وكلمات' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360)

  await page.getByRole('link', { name: 'ابدأ اللعب' }).click()
  await openClue(page)
  await chooseLetters(page, 'كتبا')
  await submitAnswer(page)
  await expect(page.getByRole('status')).toContainText('غير صحيحة')
  await page.getByRole('button', { name: 'الخانة ٣: ب' }).click()
  await page.getByRole('button', { name: 'الخانة ٤: ا' }).click()
  await chooseLetters(page, 'اب')
  await submitAnswer(page)
  await expect(page.getByRole('button', { name: 'الحرف ت', exact: true })).toHaveClass(/solved/)

  await openClue(page)
  await expect(page.getByRole('img', { name: 'أداة صغيرة تفتح القفل' })).toBeVisible()
  expect(await page.locator('.picture img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  await expect(page.getByRole('button', { name: 'الخانة ٣: ت' })).toBeDisabled()
  await page.getByRole('button', { name: /اكشف حرفًا/ }).click()
  await page.getByRole('button', { name: /احذف حرفًا/ }).click()
  await chooseLetters(page, 'ف')
  await page.reload()
  await expect(page.getByLabel('رصيد التلميحات ٧', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'الخانة ١: م' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'الخانة ٢: ف' })).toBeEnabled()
  await chooseLetters(page, 'اح')
  await submitAnswer(page)

  await openClue(page)
  await chooseLetters(page, 'بر')
  await submitAnswer(page)
  await openClue(page)
  await chooseLetters(page, 'يشة')
  await submitAnswer(page)
  await expect(page.getByRole('heading', { name: 'أحسنت!' })).toBeVisible()
  await expect(page.getByLabel('١ من ٣ نجوم')).toBeVisible()
  await page.getByRole('link', { name: 'المستوى التالي' }).click()
  await expect(page.getByRole('heading', { name: 'في الطبيعة' })).toBeVisible()
})

test('supports keyboard selection at a crossing and through the letter bank', async ({ page }) => {
  await page.goto('/#/level/study')
  const intersection = page.getByRole('button', { name: 'خانة ٣، ٦' })
  await intersection.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /خمّن الصورة/ })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /١ أكمل العبارة/ })).toHaveAttribute('aria-pressed', 'true')
  await openClue(page)
  await page.getByRole('link', { name: 'شبكة الكلمات' }).focus()
  for (const letter of 'كتا') {
    await page.getByRole('link', { name: 'شبكة الكلمات' }).dispatchEvent('keydown', { key: letter })
  }
  await page.locator('.letter-bank').getByRole('button', { name: 'ب', exact: true }).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'تحقّق من الإجابة' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'الحرف ك', exact: true })).toHaveClass(/solved/)
})
