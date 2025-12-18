import { test as base } from '@playwright/test';
import { startCoverage, stopCoverage, saveCoverageData } from '../coverage-setup';

// Extend base test with coverage collection
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Only collect coverage if COLLECT_COVERAGE env var is set
    if (process.env.COLLECT_COVERAGE) {
      await startCoverage(page);
    }
    
    try {
      await use(page);
    } finally {
      // Stop coverage collection after test
      if (process.env.COLLECT_COVERAGE) {
        const coverage = await stopCoverage(page);
        if (coverage && coverage.length > 0) {
          const testName = `${testInfo.project.name}-${testInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}`;
          saveCoverageData(coverage, testName);
        }
      }
    }
  },
});

export { expect } from '@playwright/test';

