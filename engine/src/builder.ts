import { BuildEvent, BuildResult } from './types';
import { createTempWorkspace, writeAnchorProject, cleanupWorkspace } from './workspace';
import { generateCode } from './generator';
import { compile } from './compiler';
import { runTests } from './tester';
import { deploy } from './deployer';
import { generateSDK } from './sdk-gen';
import {
  logBuildStart,
  logBuildComplete,
  logBuildError
} from './chain-logger';
import { randomBytes } from 'crypto';

export async function executeBuild(
  spec: string,
  onEvent: (event: BuildEvent) => void
): Promise<BuildResult> {
  const buildId = randomBytes(16).toString('hex');
  const logs: string[] = [];
  let workspacePath: string | null = null;
  let projectPath: string | null = null;

  try {
    // Log build start
    await logBuildStart(buildId, spec);
    logs.push(`Build started: ${buildId}`);

    // Step 1: Create temp workspace
    onEvent({
      type: 'progress',
      step: 1,
      total: 7,
      description: 'Creating workspace...'
    });
    workspacePath = await createTempWorkspace();
    logs.push(`Workspace created: ${workspacePath}`);

    // Step 2: Generate code with Claude
    onEvent({
      type: 'progress',
      step: 2,
      total: 7,
      description: 'Analyzing spec with Claude AI...'
    });
    
    const { programCode, testCode, programName } = await generateCode(spec);
    
    onEvent({
      type: 'code',
      file: 'lib.rs',
      content: programCode
    });
    
    onEvent({
      type: 'code',
      file: `${programName}.ts`,
      content: testCode
    });
    
    logs.push(`Generated program: ${programName}`);

    // Step 3: Write files to workspace
    onEvent({
      type: 'progress',
      step: 3,
      total: 7,
      description: 'Setting up Anchor project...'
    });
    
    const workspaceInfo = await writeAnchorProject(
      workspacePath,
      programName,
      programCode,
      testCode
    );
    projectPath = workspaceInfo.path;
    logs.push(`Project initialized at ${projectPath}`);

    // Step 4: Compile with anchor build
    onEvent({
      type: 'progress',
      step: 4,
      total: 7,
      description: 'Compiling with anchor build...'
    });
    
    const buildResult = await compile(projectPath);
    
    onEvent({
      type: 'terminal',
      output: buildResult.stdout + buildResult.stderr
    });

    if (!buildResult.success) {
      logs.push('Build failed');
      await logBuildError(buildId, 'compile', buildResult.error || 'Unknown error');
      
      return {
        success: false,
        error: `Compilation failed: ${buildResult.stderr}`,
        logs
      };
    }
    
    logs.push('Build successful');

    // Step 5: Run tests (optional, non-blocking)
    onEvent({
      type: 'progress',
      step: 5,
      total: 7,
      description: 'Running tests...'
    });
    
    const testResult = await runTests(projectPath);
    
    onEvent({
      type: 'terminal',
      output: testResult.stdout + testResult.stderr
    });
    
    if (testResult.success) {
      logs.push('Tests passed');
    } else {
      logs.push('Tests failed (continuing to deploy)');
    }

    // Step 6: Deploy to devnet
    onEvent({
      type: 'progress',
      step: 6,
      total: 7,
      description: 'Deploying to Solana devnet...'
    });
    
    const deployResult = await deploy(projectPath);
    
    onEvent({
      type: 'terminal',
      output: deployResult.stdout + deployResult.stderr
    });

    if (!deployResult.success || !deployResult.programId) {
      logs.push('Deployment failed');
      await logBuildError(buildId, 'deploy', deployResult.error || 'Unknown error');
      
      return {
        success: false,
        error: `Deployment failed: ${deployResult.stderr}`,
        logs
      };
    }
    
    const programId = deployResult.programId;
    logs.push(`Deployed to devnet: ${programId}`);

    // Step 7: Generate SDK
    onEvent({
      type: 'progress',
      step: 7,
      total: 7,
      description: 'Generating TypeScript SDK...'
    });
    
    const sdk = await generateSDK(programName, programId, programCode);
    logs.push('SDK generated');

    // Log completion
    await logBuildComplete(buildId, programId, programName);

    // Send complete event
    onEvent({
      type: 'complete',
      programId,
      programName,
      sdk
    });

    logs.push('Build complete!');

    return {
      success: true,
      programId,
      programName,
      sdk,
      logs
    };

  } catch (error: any) {
    const errorMsg = error.message || String(error);
    logs.push(`Error: ${errorMsg}`);
    
    await logBuildError(buildId, 'unknown', errorMsg);
    
    onEvent({
      type: 'error',
      error: errorMsg
    });

    return {
      success: false,
      error: errorMsg,
      logs
    };
  } finally {
    // Cleanup workspace (optional, keep for debugging)
    // if (workspacePath) {
    //   await cleanupWorkspace(workspacePath);
    // }
  }
}
