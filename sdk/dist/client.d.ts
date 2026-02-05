/**
 * SolForge Client - Anchor program wrapper
 * @module @solforge/sdk
 */
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, BN } from '@coral-xyz/anchor';
import type { SolForgeClientConfig, InitializeOptions, RegisterBuilderOptions, RequestBuildOptions, ClaimBuildOptions, LogBuildStepOptions, CompleteBuildOptions, GetAllBuildsFilter, ProtocolState, BuildRequest, BuilderProfile, BuildStep } from './types';
export declare class SolForgeClient {
    readonly connection: Connection;
    readonly program: Program;
    readonly programId: PublicKey;
    constructor(config?: SolForgeClientConfig);
    /**
     * Initialize the protocol
     * @param options Initialize options
     * @returns Transaction signature
     */
    initialize(options: InitializeOptions): Promise<string>;
    /**
     * Register a builder
     * @param options Register builder options
     * @returns Transaction signature
     */
    registerBuilder(options: RegisterBuilderOptions): Promise<string>;
    /**
     * Request a build
     * @param options Request build options
     * @returns Transaction signature and build request PDA
     */
    requestBuild(options: RequestBuildOptions): Promise<{
        signature: string;
        buildRequestPda: PublicKey;
        buildId: BN;
    }>;
    /**
     * Claim a build
     * @param options Claim build options
     * @returns Transaction signature
     */
    claimBuild(options: ClaimBuildOptions): Promise<string>;
    /**
     * Log a build step
     * @param options Log build step options
     * @returns Transaction signature
     */
    logBuildStep(options: LogBuildStepOptions): Promise<string>;
    /**
     * Complete a build
     * @param options Complete build options
     * @returns Transaction signature
     */
    completeBuild(options: CompleteBuildOptions): Promise<string>;
    /**
     * Get a build request account
     * @param buildRequestPda Build request PDA
     * @returns Build request account data
     */
    getBuildRequest(buildRequestPda: PublicKey): Promise<BuildRequest>;
    /**
     * Get protocol state
     * @returns Protocol state account data
     */
    getProtocolState(): Promise<ProtocolState>;
    /**
     * Get builder profile
     * @param builderAuthority Builder authority public key
     * @returns Builder profile account data
     */
    getBuilderProfile(builderAuthority: PublicKey): Promise<BuilderProfile>;
    /**
     * Get a build step
     * @param buildRequestPda Build request PDA
     * @param stepNumber Step number (0-indexed)
     * @returns Build step account data
     */
    getBuildStep(buildRequestPda: PublicKey, stepNumber: number): Promise<BuildStep>;
    /**
     * Get all builds (optionally filtered)
     * @param filter Optional filter criteria
     * @returns Array of build requests with their PDAs
     */
    getAllBuilds(filter?: GetAllBuildsFilter): Promise<Array<{
        pubkey: PublicKey;
        account: BuildRequest;
    }>>;
    /**
     * Stream build progress from the engine (SSE)
     * This is a convenience method for connecting to the build engine's SSE endpoint
     * @param engineUrl The build engine's base URL
     * @param spec The build specification
     * @yields Build events as they occur
     */
    streamBuild(engineUrl: string, spec: string): AsyncGenerator<{
        type: string;
        data: any;
    }>;
}
//# sourceMappingURL=client.d.ts.map