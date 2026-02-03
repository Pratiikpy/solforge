import { exec } from 'child_process';
import { promisify } from 'util';
import { CompileResult } from './types';

const execAsync = promisify(exec);
const ANCHOR_PATH = '/Users/prateektripathi/.cargo/bin/anchor';

export async function compile(projectPath: string): Promise<CompileResult> {
  console.log('Compiling with anchor build...');

  try {
    const { stdout, stderr } = await execAsync(`${ANCHOR_PATH} build`, {
      cwd: projectPath,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      env: {
        ...process.env,
        PATH: `/Users/prateektripathi/.cargo/bin:${process.env.PATH}`
      }
    });

    return {
      success: true,
      stdout: stdout.toString(),
      stderr: stderr.toString()
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || '',
      error: error.message
    };
  }
}
