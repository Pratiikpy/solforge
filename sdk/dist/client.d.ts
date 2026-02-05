/**
 * SolForge Client
 * @module @solforge/sdk
 */
import { SolForgeConfig, BuildOptions, BuildRequest, BuildStatus, BuildEvent, ListOptions, BuildRecord, VerificationResult, ProgramInfo } from './types';
export declare class SolForgeClient {
    private endpoint;
    private apiKey?;
    private timeout;
    constructor(config?: Partial<SolForgeConfig>);
    /**
     * Request a new build
     * @param spec Natural language specification of the Solana program to build
     * @param options Build options (budget, network, etc.)
     * @returns Build request details
     */
    requestBuild(spec: string, options?: BuildOptions): Promise<BuildRequest>;
    /**
     * Get build status
     * @param buildId Build ID
     * @returns Current build status
     */
    getBuildStatus(buildId: string): Promise<BuildStatus>;
    /**
     * Stream build events (Server-Sent Events)
     * @param buildId Build ID
     * @yields Build events as they occur
     */
    streamBuild(buildId: string): AsyncGenerator<BuildEvent>;
    /**
     * Get build history
     * @param options List options (limit, offset, filter, sort)
     * @returns List of build records
     */
    listBuilds(options?: ListOptions): Promise<BuildRecord[]>;
    /**
     * Verify on-chain build proof
     * @param buildId Build ID
     * @param stepNumber Step number to verify (0-7)
     * @returns Verification result with on-chain proof
     */
    verifyBuildProof(buildId: string, stepNumber: number): Promise<VerificationResult>;
    /**
     * Get deployed program information
     * @param buildId Build ID
     * @returns Program information including IDL and deployment details
     */
    getDeployedProgram(buildId: string): Promise<ProgramInfo>;
    /**
     * Internal fetch wrapper with error handling
     */
    private fetch;
    /**
     * Get request headers
     */
    private getHeaders;
    /**
     * Handle error responses
     */
    private handleErrorResponse;
}
//# sourceMappingURL=client.d.ts.map