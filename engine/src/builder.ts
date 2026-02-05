import { BuildEvent, BuildResult } from './types';
import { createTempWorkspace, writeAnchorProject, cleanupWorkspace } from './workspace';
import { generateCode } from './generator';
import { compile } from './compiler';
import { runTests } from './tester';
import { deploy } from './deployer';
import { generateSDK } from './sdk-gen';
import { createBuildLogger, ChainLogResult } from './chain-logger';
import { randomBytes } from 'crypto';

export async function executeBuild(
  spec: string,
  onEvent: (event: BuildEvent) => void
): Promise<BuildResult> {
  const buildId = randomBytes(16).toString('hex');
  const logs: string[] = [];
  let workspacePath: string | null = null;
  let projectPath: string | null = null;
  
  // Create on-chain logger for this build
  const chainLogger = createBuildLogger();
  const chainTxs: ChainLogResult[] = [];

  function emitChain(result: ChainLogResult | null, label: string) {
    if (result) {
      chainTxs.push(result);
      onEvent({
        type: 'chain',
        label,
        txSignature: result.txSignature,
        explorerUrl: result.explorerUrl,
      } as any);
    }
  }

  try {
    // Step 1: Request build on-chain (escrow SOL)
    onEvent({
      type: 'progress',
      step: 1,
      total: 7,
      description: 'Registering build on Solana...'
    });
    
    const requestResult = await chainLogger.requestBuild(spec);
    emitChain(requestResult, 'Build Requested');
    
    // Claim the build
    const claimResult = await chainLogger.claimBuild();
    emitChain(claimResult, 'Build Claimed');
    
    logs.push(`Build ${buildId} registered on-chain`);

    // Step 2: Generate code with Claude
    onEvent({
      type: 'progress',
      step: 2,
      total: 7,
      description: 'Analyzing spec with Claude AI...'
    });
    
    const { programCode, testCode, programName } = await generateCode(spec);
    
    // Log analysis step on-chain
    const analyzeResult = await chainLogger.logStep('analyze', `Analyzed: ${spec.substring(0, 150)}`, spec);
    emitChain(analyzeResult, 'Analysis Logged');
    
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
    
    // Log code generation on-chain
    const codeResult = await chainLogger.logStep('generateCode', `Generated ${programName} (${programCode.length} chars)`, programCode);
    emitChain(codeResult, 'Code Generation Logged');
    
    logs.push(`Generated program: ${programName}`);

    // Step 3: Write files to workspace
    onEvent({
      type: 'progress',
      step: 3,
      total: 7,
      description: 'Setting up Anchor project...'
    });
    
    workspacePath = await createTempWorkspace();
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

    // Log compile step on-chain
    const compileContent = buildResult.stdout + buildResult.stderr;
    const compileResult = await chainLogger.logStep('compile', 
      buildResult.success ? 'Compilation successful' : 'Compilation failed',
      compileContent
    );
    emitChain(compileResult, 'Compilation Logged');

    if (!buildResult.success) {
      logs.push('Build failed');
      await chainLogger.completeBuild(null, false);
      
      return {
        success: false,
        error: `Compilation failed: ${buildResult.stderr}`,
        logs
      };
    }
    
    logs.push('Build successful');

    // Step 5: Run tests
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
    
    // Log test step on-chain
    const testContent = testResult.stdout + testResult.stderr;
    const testLogResult = await chainLogger.logStep('test',
      testResult.success ? 'All tests passed' : 'Tests completed with issues',
      testContent
    );
    emitChain(testLogResult, 'Tests Logged');
    
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
      
      // Log deploy failure on-chain
      await chainLogger.logStep('deploy', 'Deployment failed', deployResult.stderr || 'Unknown error');
      await chainLogger.completeBuild(null, false);
      
      return {
        success: false,
        error: `Deployment failed: ${deployResult.stderr}`,
        logs
      };
    }
    
    const programId = deployResult.programId;
    
    // Log deploy step on-chain
    const deployLogResult = await chainLogger.logStep('deploy', 
      `Deployed to devnet: ${programId}`,
      `Program ID: ${programId}\n${deployResult.stdout}`
    );
    emitChain(deployLogResult, 'Deployment Logged');
    
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

    // Complete build on-chain (releases escrow)
    const completeResult = await chainLogger.completeBuild(programId, true);
    emitChain(completeResult, 'Build Completed');

    // Send complete event with all chain transactions
    onEvent({
      type: 'complete',
      programId,
      programName,
      sdk,
      chainTxs: chainTxs.map(t => ({
        signature: t.txSignature,
        explorer: t.explorerUrl,
      })),
    } as any);

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
    
    // Try to mark build as failed on-chain
    try {
      await chainLogger.completeBuild(null, false);
    } catch {}
    
    onEvent({
      type: 'error',
      error: errorMsg
    });

    return {
      success: false,
      error: errorMsg,
      logs
    };
  }
}
