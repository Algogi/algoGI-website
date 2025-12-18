import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { setupCoverageDirs, saveCoverageData, loadAllCoverageFiles, filterRelevantCoverage, generateCoverageSummary } from '../coverage-setup';
import * as fs from 'fs';
import * as path from 'path';

class CoverageReporter implements Reporter {
  private coverageData: Map<string, any[]> = new Map();
  private coverageDir = path.resolve(process.cwd(), 'coverage');

  onBegin() {
    setupCoverageDirs();
    // Clean previous coverage data if needed
    const dataDir = path.join(this.coverageDir, '.nyc_output');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        try {
          fs.unlinkSync(path.join(dataDir, file));
        } catch (e) {
          // Ignore errors
        }
      });
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Coverage is collected per-page, so we'll handle it in the test fixtures
    // This reporter just tracks test completion
  }

  async onEnd(result: FullResult) {
    // Load all coverage files and generate summary
    const allCoverage = loadAllCoverageFiles();
    if (allCoverage.length > 0) {
      const filtered = filterRelevantCoverage(allCoverage);
      const summary = generateCoverageSummary(filtered);
      console.log(summary);
      
      // Save merged coverage for c8 to process
      const mergedPath = path.join(this.coverageDir, '.nyc_output', 'out.json');
      fs.writeFileSync(mergedPath, JSON.stringify(filtered, null, 2));
    }
  }
}

export default CoverageReporter;

