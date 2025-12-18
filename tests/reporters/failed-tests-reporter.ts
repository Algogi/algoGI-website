import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface FailedTest {
  title: string;
  file: string;
  line: number;
  column: number;
  project: string;
  duration: number;
  error?: {
    message: string;
    stack?: string;
  };
  screenshot?: string;
  video?: string;
  trace?: string;
}

class FailedTestsReporter implements Reporter {
  private failedTests: FailedTest[] = [];
  private outputDir: string;

  constructor() {
    // Use test-results directory for output
    this.outputDir = path.join(process.cwd(), 'test-results');
  }

  onBegin(config: FullConfig, suite: Suite) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Only collect failed tests
    if (result.status === 'failed' || result.status === 'timedOut') {
      const testFile = test.location.file;
      const relativePath = path.relative(process.cwd(), testFile);
      
      // Get error information
      let errorMessage = '';
      let errorStack = '';
      if (result.error) {
        errorMessage = result.error.message || '';
        errorStack = result.error.stack || '';
      }

      // Get artifact paths
      const screenshot = result.attachments.find(a => a.name === 'screenshot' && a.path)?.path;
      const video = result.attachments.find(a => a.name === 'video' && a.path)?.path;
      const trace = result.attachments.find(a => a.name === 'trace' && a.path)?.path;

      const failedTest: FailedTest = {
        title: test.title,
        file: relativePath,
        line: test.location.line,
        column: test.location.column,
        project: test.parent.project()?.name || 'unknown',
        duration: result.duration,
        error: errorMessage ? {
          message: errorMessage,
          stack: errorStack,
        } : undefined,
        screenshot: screenshot ? path.relative(process.cwd(), screenshot) : undefined,
        video: video ? path.relative(process.cwd(), video) : undefined,
        trace: trace ? path.relative(process.cwd(), trace) : undefined,
      };

      this.failedTests.push(failedTest);
    }
  }

  onEnd(result: FullResult) {
    // Only export if there are failed tests
    if (this.failedTests.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFile = path.join(this.outputDir, `failed-tests-${timestamp}.json`);
      
      const output = {
        summary: {
          totalFailed: this.failedTests.length,
          timestamp: new Date().toISOString(),
          totalTests: result.status === 'passed' ? 0 : this.failedTests.length,
        },
        failedTests: this.failedTests,
      };

      fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
      
      // Also create a latest.json file for easy access
      const latestFile = path.join(this.outputDir, 'failed-tests-latest.json');
      fs.writeFileSync(latestFile, JSON.stringify(output, null, 2), 'utf-8');
      
      console.log(`\n📋 Exported ${this.failedTests.length} failed test(s) to:`);
      console.log(`   ${outputFile}`);
      console.log(`   ${latestFile}`);
    }
  }
}

export default FailedTestsReporter;

