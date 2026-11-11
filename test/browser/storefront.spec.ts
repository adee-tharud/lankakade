import { test, expect } from '@playwright/test'

test('home is public, shop search/filter/pagination and product variants work, and guest cart actions request sign-in', async ({
  page,
  request,
}) => {
  const mutations: string[] = []
  page.on('request', (req) => {
    if (/\/api\/v1\/cart/.test(req.url()) && req.method() !== 'GET')
      mutations.push(req.method())
  })
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole('heading', {
      name: 'Romania Lanka Kade',
    }),
  ).toBeVisible()
  await expect(page.locator('[data-slot=product-card]')).toHaveCount(4)
  await expect(
    page.locator('[data-slot=product-card] img').first(),
  ).toBeVisible()
  expect(
    await page
      .locator('[data-slot=product-card] img')
      .first()
      .evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0)
  await page.getByRole('combobox').selectOption('en')
  await expect(
    page.getByRole('heading', {
      name: 'Romania Lanka Kade',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Sign In / Register' }),
  ).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: 'test-results/home-desktop.png',
    fullPage: true,
  })
  await page
    .getByRole('button', { name: 'Add to cart — Ceylon Cinnamon', exact: true })
    .click()
  await expect(page.getByRole('alert')).toContainText('You must sign in first.')
  expect(mutations).toEqual([])
  await page.getByRole('button', { name: 'Dismiss notification' }).click()

  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Shop', exact: true })
    .click()
  await expect(page.locator('[data-slot=product-card]')).toHaveCount(12)
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.locator('[data-slot=product-card]')).toHaveCount(3)
  await expect(page).toHaveURL(/after=/)
  await page.goBack()
  await expect(page.locator('[data-slot=product-card]')).toHaveCount(12)

  await page.getByRole('search').getByRole('searchbox').fill('Ceylon')
  await page
    .getByRole('search')
    .getByRole('button', { name: 'Search', exact: true })
    .click()
  await expect(page.locator('[data-slot=product-card]')).toHaveCount(2)
  await page.getByLabel('Category', { exact: true }).selectOption('tea')
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await expect(page.locator('[data-slot=product-card]')).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: 'Add to cart — Ceylon Black Tea' }),
  ).toBeDisabled()
  await page.getByLabel('Minimum', { exact: true }).fill('100')
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await expect(
    page.getByRole('heading', { name: 'No products found' }),
  ).toBeVisible()

  await page.goto('/shop')
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: 'test-results/shop-desktop.png',
    fullPage: true,
  })
  await page
    .locator('[data-slot=product-card] h3')
    .getByRole('link', { name: 'Ceylon Cinnamon', exact: true })
    .click()
  await expect(page).toHaveURL(/\/products\/ceylon-cinnamon$/)
  await expect(
    page.getByRole('heading', { name: 'Ceylon Cinnamon', exact: true }),
  ).toBeVisible()
  await page.getByRole('radio', { name: '100 g', exact: true }).check()
  await expect(
    page.getByRole('button', { name: 'Add to cart', exact: true }),
  ).toBeDisabled()
  await page.getByRole('radio', { name: '50 g', exact: true }).check()
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('You must sign in first.')
  expect(mutations).toEqual([])
  await page.getByRole('button', { name: 'Dismiss notification' }).click()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: 'test-results/product-desktop.png',
    fullPage: true,
  })

  for (const path of ['/', '/shop', '/products/ceylon-cinnamon']) {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    await expect(
      page.getByRole('combobox', { name: 'Website language' }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  await page.screenshot({
    path: 'test-results/product-mobile.png',
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(
    page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Home', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .press('Escape')
  await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await page.goto('/products/no-such-product')
  await expect(
    page.getByRole('heading', { name: 'This product is no longer available.' }),
  ).toBeVisible()

  const products = await request.get('/api/v1/products?limit=1')
  const list = (await products.json()).products[0]
  expect(list.imageUrl).toMatch(/^\/api\/v1\/product-images\//)
  expect(list.imageAltText).toBe('Ceylon Cinnamon')
})

test('sign-in returns to the product, customer name and cart count update, quantities persist, and logout clears cart UI', async ({
  page,
  request,
}) => {
  const email = `cart-${Date.now()}@example.test`
  const password = 'Synthetic cart customer password'
  const origin = process.env.STOREFRONT_TEST_ORIGIN || 'http://localhost:5173'
  await request.post('/api/v1/auth/register', {
    headers: { Origin: origin },
    data: { email, password, fullName: 'Pantry Customer' },
  })
  let link = ''
  await expect
    .poll(async () => {
      const response = await request.get('http://localhost:4101/email', {
        params: { email, purpose: 'email_verification' },
      })
      link = (await response.json()).link
      return Boolean(link)
    })
    .toBe(true)
  const token = new URLSearchParams(new URL(link).hash.slice(1)).get('token')
  await request.post('/api/v1/auth/verify-email', {
    headers: { Origin: origin },
    data: { token },
  })

  await page.goto('/products/white-raw-rice')
  await page.getByRole('combobox').selectOption('en')
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page
    .getByRole('alert')
    .getByRole('link', { name: 'Sign in', exact: true })
    .click()
  await page.getByLabel('Email address', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/products\/white-raw-rice$/)
  await expect(page.locator('[data-slot=account-menu] summary')).toContainText(
    'Pantry',
  )
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    'Your item has been added',
  )
  await expect(
    page.getByRole('link', { name: 'Shopping cart (2)', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Dismiss notification' }).click()
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Shopping cart (4)', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('link', { name: 'Shopping cart (4)', exact: true })
    .click()
  await expect(page.locator('[data-slot=cart-line]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Decrease quantity' }).click()
  await expect(
    page.getByRole('link', { name: 'Shopping cart (3)', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('link', { name: 'Shopping cart (3)', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Remove White Raw Rice' }).click()
  await expect(
    page.getByRole('heading', { name: 'Your cart is empty', exact: true }),
  ).toBeVisible()
  await page.locator('[data-slot=account-menu] summary').click()
  await page
    .locator('[data-slot=account-menu]')
    .getByRole('button', { name: 'Log out', exact: true })
    .click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(
    page.getByRole('link', { name: 'Sign In / Register', exact: true }),
  ).toBeVisible()
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole('heading', {
      name: 'Romania Lanka Kade',
    }),
  ).toBeVisible()
})
