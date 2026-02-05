import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { WorkspaceInfo } from './types';

const BUILD_DIR = '/tmp/solforge-builds';

export async function createTempWorkspace(): Promise<string> {
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  const timestamp = Date.now();
  const workspacePath = path.join(BUILD_DIR, `build-${timestamp}`);
  fs.mkdirSync(workspacePath, { recursive: true });

  return workspacePath;
}

export async function writeAnchorProject(
  workspacePath: string,
  programName: string,
  programCode: string,
  testCode: string
): Promise<WorkspaceInfo> {
  // Try to find anchor binary
  const anchorPaths = [
    '/Users/prateektripathi/.cargo/bin/anchor',
    '/usr/local/bin/anchor',
    'anchor',
  ];

  let anchorBin = 'anchor';
  for (const p of anchorPaths) {
    try {
      execSync(`${p} --version`, { stdio: 'pipe' });
      anchorBin = p;
      break;
    } catch {}
  }

  console.log(`Initializing Anchor project: ${programName}`);
  execSync(`${anchorBin} init ${programName}`, {
    cwd: workspacePath,
    stdio: 'pipe',
  });

  const projectPath = path.join(workspacePath, programName);

  // Write program code
  const programPath = path.join(projectPath, 'programs', programName, 'src', 'lib.rs');
  fs.writeFileSync(programPath, programCode);

  // Write test code
  const testPath = path.join(projectPath, 'tests', `${programName}.ts`);
  fs.writeFileSync(testPath, testCode);

  // Update Cargo.toml to use anchor-lang 0.30.1
  const cargoTomlPath = path.join(projectPath, 'programs', programName, 'Cargo.toml');
  let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
  cargoToml = cargoToml.replace(/anchor-lang = .*/, 'anchor-lang = "0.30.1"');
  fs.writeFileSync(cargoTomlPath, cargoToml);

  return { path: projectPath, programName };
}

export async function cleanupWorkspace(workspacePath: string): Promise<void> {
  try {
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Failed to cleanup workspace:', error);
  }
}

export function getWorkspaceStats(): { total: number; size: string } {
  if (!fs.existsSync(BUILD_DIR)) {
    return { total: 0, size: '0 MB' };
  }

  try {
    const dirs = fs.readdirSync(BUILD_DIR);
    return { total: dirs.length, size: `${dirs.length} builds` };
  } catch {
    return { total: 0, size: '0 MB' };
  }
}
