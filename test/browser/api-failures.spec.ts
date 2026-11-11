import { test, expect } from '@playwright/test'

test.use({ baseURL: 'http://localhost:5175' })

test('session service failure stays recoverable without exposing account content', async ({
  page,
}) => {
  await page.goto('/account')
  await expect(page.getByRole('alert')).toContainText(
    'Nu am putut verifica sesiunea',
  )
  await expect(
    page.getByRole('button', { name: 'Încearcă din nou' }),
  ).toBeVisible()
  await expect(page.getByText('Date personale', { exact: true })).toHaveCount(0)
})

test('login handles rate limits, malformed success, HTML gateway failure, and timeout', async ({
  page,
}) => {
  test.setTimeout(45000)
  const scenarios = [
    ['rate-limit@example.test', 'Prea multe încercări'],
    ['malformed@example.test', 'Răspunsul magazinului nu a putut fi citit'],
    ['gateway@example.test', 'Nu am putut finaliza cererea'],
    ['timeout@example.test', 'Nu am putut contacta magazinul'],
  ]
  for (const [email, message] of scenarios) {
    await page.goto('/sign-in')
    await page.getByLabel('Adresă de e-mail').fill(email)
    await page
      .getByLabel('Parolă', { exact: true })
      .fill('Synthetic failure fixture password')
    await page.getByRole('button', { name: 'Intră în cont' }).click()
    await expect(page.getByRole('alert')).toContainText(message, {
      timeout: 16000,
    })
    await expect(
      page.getByRole('button', { name: 'Intră în cont' }),
    ).toBeEnabled()
    await expect(page).toHaveURL(/\/sign-in$/)
  }
})

test('keyboard navigation reaches form controls with a visible focus indicator', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await page.getByLabel('Adresă de e-mail').focus()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Parolă', { exact: true })).toBeFocused()
  const outline = await page
    .getByLabel('Parolă', { exact: true })
    .evaluate((element) => getComputedStyle(element).outlineWidth)
  expect(parseFloat(outline)).toBeGreaterThan(0)
})
