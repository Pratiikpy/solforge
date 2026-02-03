export interface BuildEvent {
  type: 'progress' | 'code' | 'terminal' | 'error' | 'complete';
  step?: number;
  total?: number;
  description?: string;
  file?: string;
  content?: string;
  output?: string;
  error?: string;
  programId?: string;
  sdk?: string;
  programName?: string;
}

export interface BuildResult {
  success: boolean;
  programId?: string;
  programName?: string;
  sdk?: string;
  error?: string;
  logs?: string[];
}

export interface GeneratedCode {
  programCode: string;
  testCode: string;
  programName: string;
}

export interface CompileResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

export interface TestResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

export interface DeployResult {
  success: boolean;
  programId?: string;
  stdout: string;
  stderr: string;
  error?: string;
}

export interface WorkspaceInfo {
  path: string;
  programName: string;
}
