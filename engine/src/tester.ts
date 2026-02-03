import { exec } from 'child_process';
import { promisify } from 'util';
import { TestResult } from './types';

const execAsync = promisify(exec);
const ANCHOR_PATH = '/Users/prateektripathi/.cargo/bin/anchor';

export async function runTests(projectPath: string): Promise<TestResult> {
  console.log('Running tests with anchor test...');

  try {
    const { stdout, stderr } = await execAsync(
      `${ANCHOR_PATH} test --skip-local-validator`,
      {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024,
        timeout: 120000, // 2 minutes
        env: {
          ...process.env,
          PATH: `/Users/prateektripathi/.cargo/bin:${process.env.PATH}`
        }
      }
    );

    return {
      success: true,
      stdout: stdout.toString(),
      stderr: stderr.toString()
    };
  } catch (error: any) {
    // Tests can fail but that's okay, we still want to deploy
    return {
      success: false,
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || '',
      error: error.message
    };
  }
}
