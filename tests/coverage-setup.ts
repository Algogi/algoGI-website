import * as fs from 'fs';
import * as path from 'path';

export interface V8CoverageEntry {
  url: string;
  scriptId: string;
  functions: Array<{
    functionName: string;
    ranges: Array<{ startOffset: number; endOffset: number; count: number }>;
    isBlockCoverage: boolean;
  }>;
}

const coverageDir = path.resolve(process.cwd(), 'coverage');
const coverageDataDir = path.join(coverageDir, '.nyc_output');

// Ensure coverage directories exist
export function setupCoverageDirs() {
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  if (!fs.existsSync(coverageDataDir)) {
    fs.mkdirSync(coverageDataDir, { recursive: true });
  }
}

// Start coverage collection on a page
export async function startCoverage(page: any) {
  try {
    await page.coverage.startJSCoverage();
    return true;
  } catch (error) {
    console.warn('Failed to start coverage collection:', error);
    return false;
  }
}

// Stop coverage collection and get data
export async function stopCoverage(page: any): Promise<V8CoverageEntry[]> {
  try {
    const coverage = await page.coverage.stopJSCoverage();
    return coverage || [];
  } catch (error) {
    console.warn('Failed to stop coverage collection:', error);
    return [];
  }
}

// Save coverage data to file for later processing
export function saveCoverageData(coverage: V8CoverageEntry[], testName: string): string {
  const sanitizedName = testName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `coverage-${sanitizedName}-${Date.now()}.json`;
  const filePath = path.join(coverageDataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(coverage, null, 2));
  return filePath;
}

// Load all coverage files
export function loadAllCoverageFiles(): V8CoverageEntry[] {
  if (!fs.existsSync(coverageDataDir)) {
    return [];
  }
  
  const files = fs.readdirSync(coverageDataDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(coverageDataDir, file));
  
  const allCoverage: V8CoverageEntry[] = [];
  files.forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (Array.isArray(data)) {
        allCoverage.push(...data);
      } else {
        allCoverage.push(data);
      }
    } catch (error) {
      console.warn(`Failed to load coverage file ${file}:`, error);
    }
  });
  
  return allCoverage;
}

// Filter coverage to only include relevant source files
export function filterRelevantCoverage(coverage: V8CoverageEntry[]): V8CoverageEntry[] {
  return coverage.filter(entry => {
    const url = entry.url;
    
    // Exclude Next.js internal files
    if (url.includes('/_next/') || url.includes('node_modules')) {
      return false;
    }
    
    // Include localhost files (our source code)
    if (url.includes('localhost:3000') || url.includes('127.0.0.1:3000')) {
      return true;
    }
    
    // Exclude external resources
    return false;
  });
}

// Generate a simple coverage summary
export function generateCoverageSummary(coverage: V8CoverageEntry[]): string {
  const filtered = filterRelevantCoverage(coverage);
  const totalFiles = new Set(filtered.map(entry => entry.url)).size;
  const totalFunctions = filtered.reduce((sum, entry) => sum + entry.functions.length, 0);
  const coveredFunctions = filtered.reduce((sum, entry) => {
    return sum + entry.functions.filter(func => 
      func.ranges.some(range => range.count > 0)
    ).length;
  }, 0);
  
  const coveragePct = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;
  
  return `
Coverage Summary:
================
Files:      ${totalFiles}
Functions:  ${coveredFunctions}/${totalFunctions} (${coveragePct.toFixed(2)}%)
Entries:    ${filtered.length}
`;
}

