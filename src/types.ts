/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Snapshot {
    added: number;
    didUpdate: boolean;
    failure: boolean;
    filesAdded: number;
    filesRemoved: number;
    filesUnmatched: number;
    filesUpdated: number;
    matched: number;
    total: number;
    unchecked: number;
    unmatched: number;
    updated: number;
}

export interface PerfStats {
    end: any;
    start: any;
}

export interface Snapshot2 {
    added: number;
    fileDeleted: boolean;
    matched: number;
    unchecked: number;
    unmatched: number;
    updated: number;
}

export interface InsideFileTestResults {
    ancestorTitles: string[];
    duration: number;
    failureMessages: string[];
    fullName: string;
    numPassingAsserts: number;
    status: string;
    title: string;
}

export interface FileTestResult {
    console?: any;
    failureMessage: string;
    numFailingTests: number;
    numPassingTests: number;
    numPendingTests: number;
    perfStats: PerfStats;
    snapshot: Snapshot2;
    testFilePath: string;
    testResults: InsideFileTestResults[];
    sourceMaps: Record<string, unknown>;
    skipped: boolean;
    // These are from IAssertionResult
    status?: string;
    title?: string;
}

export interface JestTestResults {
    numFailedTestSuites: number;
    numFailedTests: number;
    numPassedTestSuites: number;
    numPassedTests: number;
    numPendingTestSuites: number;
    numPendingTests: number;
    numRuntimeErrorTestSuites: number;
    numTotalTestSuites: number;
    numTotalTests: number;
    snapshot: Snapshot;
    startTime: number;
    success: boolean;
    testResults: FileTestResult[];
    wasInterrupted: boolean;
}

export interface AssertionResult {
    failureMessages: string[];
    status: string;
    title: string;
}

export interface TestResult {
    assertionResults: AssertionResult[];
    endTime: any;
    message: string;
    name: string;
    startTime: any;
    status: string;
    summary: string;
}

export interface JestTestOldResults {
    numFailedTestSuites: number;
    numFailedTests: number;
    numPassedTestSuites: number;
    numPassedTests: number;
    numPendingTestSuites: number;
    numPendingTests: number;
    numRuntimeErrorTestSuites: number;
    numTotalTestSuites: number;
    numTotalTests: number;
    snapshot: Snapshot;
    startTime: number;
    success: boolean;
    testResults: TestResult[];
    wasInterrupted: boolean;
}
