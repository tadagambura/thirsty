import { expect, test, type Page } from '@playwright/test';

async function finishIntro(page: Page) {
  await expect(page.getByTestId('intro')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  await expect(page.getByTestId('garden')).toBeVisible();
}

async function addPlant(page: Page, name: string, preset = 'Pothos') {
  await page.getByTestId('add-plant').first().click();
  await page.getByTestId(`preset-${preset}`).click();
  await page.getByTestId('plant-name').fill(name);
  await page.getByTestId('plant-save').click();
  await expect(page.getByTestId('plant')).toBeVisible();
}

test('add a plant → water it → gems and schedule update, and it persists', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await finishIntro(page);
  await addPlant(page, 'Cyphicus');
  await expect(page.getByTestId('water-due')).toHaveText('in 7d');
  await page.goto('/');
  await page.getByTestId('water-Cyphicus').click();
  await expect(page.getByTestId('toast')).toContainText('gulps it down');
  await page.getByTestId('water-Cyphicus').click();
  await expect(page.getByTestId('celebrate')).toContainText('snorkel'); // twice in a day: too soon
  await page.reload();
  await expect(page.getByTestId('gems')).toHaveText('💎 2');
  await expect(page.getByTestId('due-Cyphicus')).toContainText('Water in 7 days');
  expect(errors).toEqual([]);
});

test('forget for too long: the full-screen drama, then water to bring it back', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-23T09:00:00'));
  await page.goto('/');
  await finishIntro(page);
  await addPlant(page, 'Fernando', 'Fern'); // every 4 days
  await page.clock.setFixedTime(new Date('2026-12-02T09:00:00'));
  await page.goto('/');
  await expect(page.getByTestId('drama')).toContainText('NOT FERNANDO');
  await page.getByTestId('drama-water').click();
  await expect(page.getByTestId('drama')).toBeHidden();
  await expect(page.getByTestId('due-Fernando')).toContainText('Water in 4 days');
});

test('milestones earn gems; validation; free limit of 5', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await addPlant(page, 'Basil', 'Herbs');
  await page.getByTestId('new-leaf').click();
  await expect(page.getByTestId('celebrate')).toContainText('Ta-da!');
  await page.goto('/');
  await expect(page.getByTestId('gems')).toHaveText('💎 5');
  await page.getByTestId('add-plant').click();
  await page.getByTestId('plant-save').click();
  await expect(page.getByText('Every plant deserves a name.')).toBeVisible();
  for (const n of ['B', 'C', 'D', 'E']) {
    await page.goto('/');
    await addPlant(page, n);
  }
  await page.goto('/');
  await page.getByTestId('add-plant').click();
  await expect(page.getByTestId('paywall')).toBeVisible();
});
