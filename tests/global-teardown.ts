import { FullConfig } from '@playwright/test';
import { loadAllCoverageFiles, filterRelevantCoverage, generateCoverageSummary } from './coverage-setup';
import * as path from 'path';
import * as fs from 'fs';

async function globalTeardown(config: FullConfig) {
  // Load and process all coverage data
  const allCoverage = loadAllCoverageFiles();
  if (allCoverage.length > 0) {
    const filtered = filterRelevantCoverage(allCoverage);
    const summary = generateCoverageSummary(filtered);
    console.log('\n' + summary);
    
    // Save final merged coverage
    const coverageDir = path.resolve(process.cwd(), 'coverage');
    const mergedPath = path.join(coverageDir, '.nyc_output', 'out.json');
    fs.writeFileSync(mergedPath, JSON.stringify(filtered, null, 2));
  }
}

export default globalTeardown;

