import { TestCase } from './problems';

export interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
  error?: string;
  isHidden?: boolean;
}

export interface ExecutionResult {
  allPassed: boolean;
  testResults: TestResult[];
  totalTests: number;
  passedTests: number;
  totalExecutionTime: number;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded';
}

/**
 * Normalize output by trimming whitespace and standardizing line endings
 */
function normalizeOutput(output: string): string {
  return output
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/gm, '') // Remove trailing whitespace from each line
    .toLowerCase();
}

/**
 * Compare actual output with expected output
 */
function compareOutputs(actual: string, expected: string): boolean {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  return normalizedActual === normalizedExpected;
}

/**
 * Execute code against a single test case using the Piston API
 */
async function executeTestCase(
  code: string,
  language: string,
  testCase: TestCase,
  timeLimit: number, // in seconds
  apiUrl: string
): Promise<TestResult> {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
        input: testCase.input,
      }),
    });

    const result = await response.json();
    const executionTime = result.executionTime || 0;

    // Check for compilation error
    if (!result.success && result.error) {
      return {
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        executionTime,
        error: result.error,
        isHidden: testCase.isHidden,
      };
    }

    // Compare outputs
    const actualOutput = result.output || '';
    const passed = compareOutputs(actualOutput, testCase.expectedOutput);

    return {
      passed,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      executionTime,
      isHidden: testCase.isHidden,
    };
  } catch (error: any) {
    return {
      passed: false,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: '',
      executionTime: 0,
      error: error.message || 'Execution failed',
      isHidden: testCase.isHidden,
    };
  }
}

/**
 * Run code against all test cases
 */
export async function runTestCases(
  code: string,
  language: string,
  testCases: TestCase[],
  timeLimit: number,
  apiUrl: string
): Promise<ExecutionResult> {
  const testResults: TestResult[] = [];
  let totalExecutionTime = 0;
  let hasCompilationError = false;
  let hasRuntimeError = false;
  let hasTimeLimitExceeded = false;

  // Run each test case sequentially
  for (const testCase of testCases) {
    const result = await executeTestCase(code, language, testCase, timeLimit, apiUrl);
    testResults.push(result);
    totalExecutionTime += result.executionTime;

    // Check for errors
    if (result.error) {
      if (result.error.includes('compilation') || result.error.includes('Compilation')) {
        hasCompilationError = true;
        break; // Stop on compilation error
      } else if (result.error === 'Time Limit Exceeded') {
        hasTimeLimitExceeded = true;
        break; // Stop on TLE
      } else {
        hasRuntimeError = true;
      }
    }
  }

  const passedTests = testResults.filter(r => r.passed).length;
  const allPassed = passedTests === testCases.length;

  // Determine status
  let status: ExecutionResult['status'];
  if (hasCompilationError) {
    status = 'Compilation Error';
  } else if (hasTimeLimitExceeded) {
    status = 'Time Limit Exceeded';
  } else if (hasRuntimeError) {
    status = 'Runtime Error';
  } else if (allPassed) {
    status = 'Accepted';
  } else {
    status = 'Wrong Answer';
  }

  return {
    allPassed,
    testResults,
    totalTests: testCases.length,
    passedTests,
    totalExecutionTime,
    status,
  };
}

/**
 * Filter test results to hide hidden test case details
 * (used when returning results to frontend)
 */
export function filterHiddenTestResults(results: TestResult[]): TestResult[] {
  return results.map(result => {
    if (result.isHidden) {
      return {
        ...result,
        input: '[Hidden]',
        expectedOutput: '[Hidden]',
        actualOutput: result.passed ? '[Hidden]' : '[Hidden]',
      };
    }
    return result;
  });
}
