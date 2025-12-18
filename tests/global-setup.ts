import { FullConfig } from '@playwright/test';
import { setupCoverageDirs } from './coverage-setup';

async function globalSetup(config: FullConfig) {
  // Setup coverage directories
  setupCoverageDirs();
}

export default globalSetup;

