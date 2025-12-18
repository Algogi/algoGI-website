import { Page } from '@playwright/test';
import { startCoverage, stopCoverage, saveCoverageData } from '../coverage-setup';

/**
 * Helper to collect coverage for a test
 * Usage in tests:
 * 
 * test('my test', async ({ page }) => {
 *   const collectCoverage = await setupCoverageForTest(page, test.info());
 *   // ... your test code ...
 *   await collectCoverage();
 * });
 */
export async function setupCoverageForTest(page: Page, testInfo: any) {
  if (!process.env.COLLECT_COVERAGE) {
    return async () => {}; // No-op if coverage not enabled
  }
  
  await startCoverage(page);
  
  return async () => {
    const coverage = await stopCoverage(page);
    if (coverage && coverage.length > 0) {
      const testName = `${testInfo.project.name}-${testInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}`;
      saveCoverageData(coverage, testName);
    }
  };
}

