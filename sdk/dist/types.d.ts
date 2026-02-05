/**
 * SolForge SDK Types
 * @module @solforge/sdk
 */
export interface SolForgeConfig {
    /** API endpoint (default: https://solforge.dev/api) */
    endpoint: string;
    /** Optional API key for authenticated requests */
    apiKey?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
}
export interface BuildOptions {
    /** SOL amount to pay for the build (default: 0.1) */
    budget?: number;
    /** Network to deploy to (default: devnet) */
    network?: 'devnet' | 'mainnet-beta';
    /** Callback URL for build completion notifications */
    webhookUrl?: string;
    /** Additional metadata */
    metadata?: Record<string, any>;
}
export interface BuildRequest {
    /** Unique build ID */
    id: string;
    /** Build specification */
    spec: string;
    /** Current status */
    status: BuildStatus['status'];
    /** Creation timestamp */
    createdAt: string;
    /** Estimated completion time */
    estimatedCompletion?: string;
    /** Payment transaction signature */
    paymentTx?: string;
}
export interface BuildStatus {
    /** Build ID */
    id: string;
    /** Current status */
    status: 'pending' | 'analyzing' | 'generating' | 'compiling' | 'testing' | 'deploying' | 'completed' | 'failed';
    /** Current step (0-7) */
    currentStep: number;
    /** Total steps */
    totalSteps: number;
    /** Progress percentage (0-100) */
    progress: number;
    /** Status message */
    message: string;
    /** Deployed program address (if completed) */
    programId?: string;
    /** Build artifacts */
    artifacts?: {
        sourceCode?: string;
        idl?: any;
        testResults?: string;
    };
    /** Error details (if failed) */
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    /** Creation timestamp */
    createdAt: string;
    /** Completion timestamp */
    completedAt?: string;
}
export interface BuildEvent {
    /** Event type */
    type: 'status' | 'log' | 'artifact' | 'complete' | 'error';
    /** Event timestamp */
    timestamp: string;
    /** Event data */
    data: any;
}
export interface ListOptions {
    /** Maximum number of results (default: 50) */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
    /** Filter by status */
    status?: BuildStatus['status'];
    /** Sort order (default: desc) */
    order?: 'asc' | 'desc';
}
export interface BuildRecord {
    /** Build ID */
    id: string;
    /** Build specification */
    spec: string;
    /** Current status */
    status: BuildStatus['status'];
    /** Program ID (if deployed) */
    programId?: string;
    /** Creation timestamp */
    createdAt: string;
    /** Completion timestamp */
    completedAt?: string;
}
export interface VerificationResult {
    /** Whether the proof is valid */
    valid: boolean;
    /** On-chain transaction signature */
    signature: string;
    /** Proof data */
    proof: {
        buildId: string;
        stepNumber: number;
        stepName: string;
        hash: string;
        timestamp: number;
    };
    /** Verification timestamp */
    verifiedAt: string;
}
export interface ProgramInfo {
    /** Program address */
    programId: string;
    /** Network */
    network: string;
    /** IDL (Interface Definition Language) */
    idl: any;
    /** Source code URL */
    sourceUrl?: string;
    /** Deployment transaction */
    deploymentTx: string;
    /** Deployment timestamp */
    deployedAt: string;
    /** Program metadata */
    metadata?: Record<string, any>;
}
export declare class SolForgeError extends Error {
    code: string;
    statusCode?: number | undefined;
    details?: any | undefined;
    constructor(message: string, code: string, statusCode?: number | undefined, details?: any | undefined);
}
//# sourceMappingURL=types.d.ts.map