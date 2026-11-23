import { expect, test, type Page } from '@playwright/test';

async function finishIntro(page: Page) {
  await expect(page.getByTestId('intro')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  await expect(page.getByTestId('garden')).toBeVisible();
}

async function addPlant(page: Page, name: string, preset = 'pothos') {
  await page.getByTestId('add-plant').first().click();
  await page.getByTestId('plant-search').fill(preset);
  await page.locator('[data-testid^="lib-"]').first().click();
  await page.getByTestId('plant-name').fill(name);
  await page.getByTestId('plant-save').click();
  await expect(page.getByTestId('plant')).toBeVisible();
}

test('add a plant → water it → gems and schedule update, and it persists', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-06-10T09:00:00')); // summer rhythm
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await finishIntro(page);
  await addPlant(page, 'Cyphicus');
  await expect(page.getByTestId('water-due')).toHaveText(/^in \d+d$/);
  await page.goto('/');
  await page.getByTestId('water-Cyphicus').click();
  await expect(page.getByTestId('toast')).toContainText('gulps it down');
  await page.getByTestId('water-Cyphicus').click();
  await expect(page.getByTestId('celebrate')).toContainText('snorkel'); // twice in a day: too soon
  await page.reload();
  await expect(page.getByTestId('gems')).toHaveText('💎 2');
  await expect(page.getByTestId('due-Cyphicus')).toContainText(/Water in \d+ days/);
  expect(errors).toEqual([]);
});

test('forget for too long: the full-screen drama, then water to bring it back', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-06-01T09:00:00'));
  await page.goto('/');
  await finishIntro(page);
  await addPlant(page, 'Fernando', 'boston fern');
  await page.clock.setFixedTime(new Date('2026-08-15T09:00:00')); // weeks of neglect
  await page.goto('/');
  await expect(page.getByTestId('drama')).toContainText('NOT FERNANDO');
  await page.getByTestId('drama-water').click();
  await expect(page.getByTestId('drama')).toBeHidden();
  await expect(page.getByTestId('due-Fernando')).toContainText(/Water in \d+ days/);
});

test('milestones earn gems; validation; rare plants are Premium', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await addPlant(page, 'Basil', 'basil');
  await page.getByTestId('new-leaf').click();
  await expect(page.getByTestId('celebrate')).toContainText('Ta-da!');
  await page.goto('/');
  await expect(page.getByTestId('gems')).toHaveText('💎 5');
  await page.getByTestId('add-plant').click();
  await page.getByTestId('lib-other').click();
  await page.getByTestId('plant-save').click();
  await expect(page.getByText('Every plant deserves a name.')).toBeVisible();
  // Rare plants are Premium for free users
  await page.goto('/plant/new');
  await page.getByTestId('plant-search').fill('albo');
  await page.locator('[data-testid^="lib-"]').first().click();
  await expect(page.getByTestId('paywall')).toBeVisible();
});

test('library plant: tailored care, plant doctor, digital twin play, relevant cards, league', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await addPlant(page, 'Monty', 'monstera');
  await expect(page.getByTestId('care')).toContainText('Source:');
  await page.getByTestId('doctor').click();
  await expect(page.getByText(/Likely:/).first()).toBeVisible();
  await page.getByTestId('sheet-close').click();
  await page.getByTestId('play-sing').click();
  await expect(page.getByTestId('toast')).toContainText('sways');
  await expect(page.getByTestId('twin-face')).toHaveText('🤩');
  await page.locator('[data-testid^="tip-"]').first().click();
  await expect(page.getByText(/Source:/).last()).toBeVisible();
  await page.goto('/');
  await expect(page.getByTestId('league')).toContainText('Seedling league');
  await page.goto('/learn');
  await expect(page.getByTestId('cards-progress')).toContainText('of 40 cards');
});
