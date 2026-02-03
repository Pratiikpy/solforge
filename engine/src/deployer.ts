import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { DeployResult } from './types';

const execAsync = promisify(exec);
const ANCHOR_PATH = '/Users/prateektripathi/.cargo/bin/anchor';
const SOLANA_PATH = '/opt/homebrew/bin/solana';
const DEPLOY_KEY = '/Users/prateektripathi/.openclaw/workspace/autonomous-builder-x/deploy-key.json';

export async function deploy(projectPath: string): Promise<DeployResult> {
  console.log('Deploying to Solana devnet...');

  try {
    // Configure Solana CLI to use devnet and our keypair
    await execAsync(`${SOLANA_PATH} config set --url devnet`, {
      cwd: projectPath
    });

    await execAsync(`${SOLANA_PATH} config set --keypair ${DEPLOY_KEY}`, {
      cwd: projectPath
    });

    // Airdrop some SOL if needed (ignore errors if already funded)
    try {
      await execAsync(`${SOLANA_PATH} airdrop 2`, {
        cwd: projectPath,
        timeout: 30000
      });
    } catch (e) {
      console.log('Airdrop failed or not needed, continuing...');
    }

    // Deploy with anchor
    const { stdout, stderr } = await execAsync(
      `${ANCHOR_PATH} deploy --provider.cluster devnet`,
      {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024,
        timeout: 180000, // 3 minutes
        env: {
          ...process.env,
          PATH: `/Users/prateektripathi/.cargo/bin:/opt/homebrew/bin:${process.env.PATH}`
        }
      }
    );

    // Parse program ID from output
    const output = stdout.toString();
    const programIdMatch = output.match(/Program Id: ([1-9A-HJ-NP-Za-km-z]{32,44})/);
    
    if (!programIdMatch) {
      throw new Error('Failed to extract Program ID from deploy output');
    }

    const programId = programIdMatch[1];

    return {
      success: true,
      programId,
      stdout: output,
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

export async function getProgramId(projectPath: string, programName: string): Promise<string | null> {
  try {
    const targetDir = path.join(projectPath, 'target', 'deploy');
    const keypairPath = path.join(targetDir, `${programName}-keypair.json`);
    
    if (!fs.existsSync(keypairPath)) {
      return null;
    }

    const { stdout } = await execAsync(
      `${SOLANA_PATH} address -k ${keypairPath}`
    );

    return stdout.toString().trim();
  } catch (error) {
    console.error('Failed to get program ID:', error);
    return null;
  }
}
