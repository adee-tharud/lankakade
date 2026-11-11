import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from '@playwright/test'

const email = `storefront-${Date.now()}@example.test`
const originalPassword = 'Synthetic pantry passphrase 1'
const replacementPassword = 'Synthetic replacement phrase 2'

async function emailLink(
  request: APIRequestContext,
  purpose: string,
  address = email,
) {
  let link: string | null = null
  await expect
    .poll(async () => {
      const response = await request.get('http://localhost:4101/email', {
        params: { email: address, purpose },
      })
      link = (await response.json()).link
      return Boolean(link)
    })
    .toBe(true)
  return link!
}

async function signIn(page: Page, password = originalPassword) {
  await page.goto('/sign-in')
  await page.getByLabel('Adresă de e-mail', { exact: true }).fill(email)
  await page.getByLabel('Parolă', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Intră în cont' }).click()
}

test('customer registration, email verification, session, profile, addresses, recovery, and expiry', async ({
  page,
  request,
}) => {
  await page.goto('/account/addresses')
  await expect(page).toHaveURL(/\/sign-in$/)
  await page.setViewportSize({ width: 1440, height: 1050 })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: 'test-results/sign-in-desktop.png',
    fullPage: true,
  })
  await page.getByRole('link', { name: 'Creează un cont', exact: true }).click()
  await page.getByLabel('Nume complet').fill('Mara Popescu')
  await page.getByLabel('Adresă de e-mail').fill(email)
  await page.getByLabel('Parolă', { exact: true }).fill(originalPassword)
  await page
    .getByLabel('Confirmă parola', { exact: true })
    .fill('different password')
  await page.getByRole('button', { name: 'Creează contul' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Parolele nu se potrivesc',
  )
  await page
    .getByLabel('Confirmă parola', { exact: true })
    .fill(originalPassword)
  await page.getByRole('button', { name: 'Creează contul' }).click()
  await expect(
    page.getByRole('heading', { name: 'Verifică-ți căsuța poștală.' }),
  ).toBeVisible()

  const verification = await emailLink(request, 'email_verification')
  await page.goto(verification)
  await expect(page).toHaveURL(/\/verify-email$/)
  await expect(page.locator('input[type="hidden"]')).toHaveCount(0)
  let releaseVerification!: () => void
  const verificationGate = new Promise<void>((resolve) => {
    releaseVerification = resolve
  })
  await page.route('**/api/v1/auth/verify-email', async (route) => {
    await verificationGate
    await route.continue()
  })
  await page.getByRole('button', { name: 'Confirmă e-mailul' }).click()
  const verifying = page.getByRole('button', { name: 'Se verifică e-mailul…' })
  await expect(verifying).toBeDisabled()
  await expect(verifying).toHaveAttribute('aria-busy', 'true')
  await expect(verifying.locator('.spin')).toBeVisible()
  releaseVerification()
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('status')).toContainText(
    'Adresa de e-mail a fost verificată',
  )
  await page.unroute('**/api/v1/auth/verify-email')
  await signIn(page)
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByRole('heading', { name: 'Bună, Mara.' })).toBeVisible()
  const cookies = await page.context().cookies()
  const cookie = cookies.find((cookie) => cookie.name === 'lankakade_session')
  expect(cookie?.httpOnly).toBe(true)
  expect(cookie?.sameSite).toBe('Lax')
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys(localStorage).filter(
            (key) => key !== 'lankakade.language',
          ).length + sessionStorage.length,
      ),
    )
    .toBe(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bună, Mara.' })).toBeVisible()
  await page.getByLabel('Nume complet', { exact: true }).fill('Mara Ionescu')
  await page.getByLabel('Telefon (opțional)').fill('+40700000123')
  await page.getByRole('button', { name: 'Salvează modificările' }).click()
  await expect(page.getByRole('status')).toContainText('actualizate')
  await page.reload()
  await expect(page.getByLabel('Nume complet', { exact: true })).toHaveValue(
    'Mara Ionescu',
  )
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: 'test-results/account-desktop.png',
    fullPage: true,
  })

  await page
    .getByRole('navigation', { name: 'Meniul contului' })
    .getByRole('link', { name: 'Adrese salvate' })
    .click()
  await page.getByRole('button', { name: 'Adaugă prima adresă' }).click()
  await page.getByLabel('Denumire (opțional)').fill('Acasă')
  await page.getByLabel('Numele destinatarului').fill('Mara Ionescu')
  await page.getByLabel('Telefon', { exact: true }).fill('+40700000123')
  await page.getByLabel('Stradă, număr, bloc').fill('Strada Exemplu 12')
  await page.getByLabel('Localitate', { exact: true }).fill('București')
  await page.getByLabel('Județ / sector').fill('Sector 1')
  await page.getByLabel('Cod poștal').fill('010101')
  await page.getByRole('button', { name: 'Salvează adresa' }).click()
  await expect(page.getByRole('article')).toContainText('Strada Exemplu 12')
  await page.getByRole('button', { name: 'Editează', exact: true }).click()
  await page.getByLabel('Stradă, număr, bloc').fill('Strada Nouă 14')
  await page.getByRole('button', { name: 'Salvează adresa' }).click()
  await expect(page.getByRole('article')).toContainText('Strada Nouă 14')
  await page.reload()
  await expect(page.getByRole('article')).toContainText('Strada Nouă 14')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: 'test-results/addresses-mobile.png',
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('button', { name: 'Șterge', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Da, șterge' })).toBeVisible()
  await page.getByRole('button', { name: 'Păstrează' }).click()
  await expect(page.getByRole('article')).toHaveCount(1)
  await page.getByRole('button', { name: 'Șterge', exact: true }).click()
  await page.getByRole('button', { name: 'Da, șterge' }).click()
  await expect(page.getByRole('article')).toHaveCount(0)
  await page.getByRole('button', { name: 'Deconectare', exact: true }).click()
  await expect(page).toHaveURL(/\/sign-in$/)

  await page.getByRole('link', { name: 'Ai uitat parola?' }).click()
  await expect(
    page.getByRole('heading', { name: 'Ai uitat parola?' }),
  ).toBeVisible()
  await page.getByLabel('Adresă de e-mail').fill(email)
  await page.getByRole('button', { name: 'Trimite linkul' }).click()
  await expect(
    page.getByRole('heading', { name: 'Verifică-ți căsuța poștală.' }),
  ).toBeVisible()
  const reset = await emailLink(request, 'password_reset')
  await page.goto(reset)
  await expect(page).toHaveURL(/\/reset-password$/)
  await page
    .getByLabel('Parolă nouă', { exact: true })
    .fill(replacementPassword)
  await page.getByLabel('Confirmă parola nouă').fill(replacementPassword)
  await page.getByRole('button', { name: 'Salvează parola' }).click()
  await expect(
    page.getByRole('heading', { name: 'Parola a fost actualizată.' }),
  ).toBeVisible()
  await signIn(page)
  await expect(page.getByRole('alert')).toContainText('incorectă')
  await signIn(page, replacementPassword)
  await expect(page).toHaveURL(/\/account$/)
  await request.post('http://localhost:4101/expire-sessions')
  await page
    .getByRole('navigation', { name: 'Meniul contului' })
    .getByRole('link', { name: 'Adrese salvate' })
    .click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await page.goto(reset)
  await page
    .getByLabel('Parolă nouă', { exact: true })
    .fill(replacementPassword)
  await page.getByLabel('Confirmă parola nouă').fill(replacementPassword)
  await page.getByRole('button', { name: 'Salvează parola' }).click()
  await expect(page.getByRole('alert')).toContainText('expirat')
})

test('mobile registration, password visibility, missing link, and narrow layouts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/register')
  await page.getByLabel('Parolă', { exact: true }).fill(originalPassword)
  await page
    .getByRole('button', { name: 'Arată parola', exact: true })
    .first()
    .click()
  await expect(page.getByLabel('Parolă', { exact: true })).toHaveAttribute(
    'type',
    'text',
  )
  await page.getByRole('button', { name: 'Ascunde parola' }).click()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: 'test-results/register-mobile.png',
    fullPage: true,
  })
  for (const path of [
    '/register',
    '/sign-in',
    '/forgot-password',
    '/reset-password',
  ]) {
    await page.setViewportSize({ width: 320, height: 760 })
    await page.goto(path)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  }
  await expect(
    page.getByRole('heading', { name: 'Ai nevoie de un link nou.' }),
  ).toBeVisible()
})

test('English and Romanian work across routes, preserve form drafts, and persist after reload', async ({
  page,
  request,
}) => {
  await page.goto('/sign-in')
  const selector = page.getByRole('combobox')
  await expect(selector).toBeVisible()
  await selector.selectOption('en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(
    page.getByRole('heading', { name: 'Welcome back.' }),
  ).toBeVisible()
  await page.reload()
  await expect(page.getByRole('combobox')).toHaveValue('en')
  await expect(page).toHaveTitle('Your account · Romania Lanka Kade')
  await expect(page.getByRole('contentinfo').getByRole('link')).toHaveCount(0)

  for (const path of [
    '/register',
    '/forgot-password',
    '/verify-email',
    '/reset-password',
    '/missing-page',
  ]) {
    await page.goto(path)
    await expect(page.getByRole('combobox')).toHaveValue('en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  }

  const englishEmail = `english-${Date.now()}@example.test`
  await page.goto('/register')
  await page.getByLabel('Full name').fill('English Customer')
  await page.getByLabel('Email address', { exact: true }).fill(englishEmail)
  await page.getByLabel('Password', { exact: true }).fill(originalPassword)
  await page.getByLabel('Confirm password', { exact: true }).fill('Mismatch')
  await page.getByRole('button', { name: 'Create your account' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'The passwords do not match.',
  )
  await page.getByRole('combobox').selectOption('ro')
  await expect(page.getByRole('alert')).toContainText(
    'Parolele nu se potrivesc.',
  )
  await expect(page.getByLabel('Nume complet')).toHaveValue('English Customer')
  await expect(page.getByLabel('Parolă', { exact: true })).toHaveValue(
    originalPassword,
  )
  await page.getByRole('combobox').selectOption('en')
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill(originalPassword)
  await page.getByRole('button', { name: 'Create your account' }).click()
  await expect(
    page.getByRole('heading', { name: 'Check your inbox.' }),
  ).toBeVisible()

  await page.goto(await emailLink(request, 'email_verification', englishEmail))
  await page.getByRole('button', { name: 'Verify email' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('status')).toContainText(
    'Your email has been verified. You can now sign in.',
  )
  await page.getByLabel('Email address', { exact: true }).fill(englishEmail)
  await page.getByLabel('Password', { exact: true }).fill('Incorrect password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Your email address or password is incorrect',
  )
  await page.getByRole('combobox').selectOption('ro')
  await expect(page.getByRole('alert')).toContainText(
    'Adresa de e-mail sau parola este incorectă',
  )
  await page.getByRole('combobox').selectOption('en')
  await page.getByLabel('Password', { exact: true }).fill(originalPassword)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(
    page.getByRole('heading', { name: 'Hello, English.' }),
  ).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Account menu' })
    .getByRole('link', { name: 'Saved addresses' })
    .click()
  await page.getByRole('button', { name: 'Add your first address' }).click()
  await page.getByLabel('Recipient name').fill('English Customer')
  await page.getByLabel('Street, number, building').fill('Example Street 12')
  await page.getByRole('combobox').selectOption('ro')
  await expect(page.getByLabel('Numele destinatarului')).toHaveValue(
    'English Customer',
  )
  await page.getByRole('combobox').selectOption('en')
  await expect(page.getByLabel('Street, number, building')).toHaveValue(
    'Example Street 12',
  )
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.setViewportSize({ width: 320, height: 760 })
  await expect(page.getByRole('combobox')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('combobox').selectOption('ro')
  await page.getByRole('combobox').selectOption('en')
  await page.screenshot({
    path: 'test-results/account-english-mobile.png',
    fullPage: true,
  })

  // A one-click logout also recovers when the server session has already expired.
  await request.post('http://localhost:4101/expire-sessions')
  await page.getByRole('button', { name: 'Log out', exact: true }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('combobox')).toHaveValue('en')
})

test('verification failures stay recoverable and language selection tolerates blocked storage', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage blocked', 'SecurityError')
    }
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/verify-email#token=synthetic-invalid-token')
  await page.getByRole('combobox').selectOption('en')
  await page.getByRole('button', { name: 'Verify email' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'This link is invalid or has expired',
  )
  await expect(page).toHaveURL(/\/verify-email$/)
  await expect(page.getByRole('button', { name: 'Verify email' })).toBeEnabled()
  await expect(
    page.getByRole('link', { name: 'Request a new link' }),
  ).toBeVisible()
  await page.getByRole('combobox').selectOption('ro')
  await expect(page.getByRole('alert')).toContainText(
    'Linkul este invalid sau a expirat',
  )
})
