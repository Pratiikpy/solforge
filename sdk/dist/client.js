"use strict";
/**
 * SolForge Client - Anchor program wrapper
 * @module @solforge/sdk
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolForgeClient = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const IDL = __importStar(require("../../target/idl/solforge.json"));
const constants_1 = require("./constants");
const pda_1 = require("./pda");
class SolForgeClient {
    constructor(config) {
        const rpcUrl = config?.rpcUrl || constants_1.RPC_ENDPOINTS.devnet;
        const commitment = config?.commitment || 'confirmed';
        this.programId = config?.programId || constants_1.SOLFORGE_PROGRAM_ID;
        this.connection = new web3_js_1.Connection(rpcUrl, commitment);
        // Create a dummy provider for read-only operations
        const wallet = new anchor_1.Wallet(web3_js_1.Keypair.generate());
        const provider = new anchor_1.AnchorProvider(this.connection, wallet, { commitment });
        this.program = new anchor_1.Program(IDL, provider);
    }
    /**
     * Initialize the protocol
     * @param options Initialize options
     * @returns Transaction signature
     */
    async initialize(options) {
        const { admin, feeBps } = options;
        if (feeBps < 0 || feeBps > 10000) {
            throw new Error('feeBps must be between 0 and 10000');
        }
        const [protocolStatePda] = (0, pda_1.findProtocolStatePda)();
        const tx = await this.program.methods
            .initialize(feeBps)
            .accounts({
            protocolState: protocolStatePda,
            admin: admin.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .signers([admin])
            .rpc();
        return tx;
    }
    /**
     * Register a builder
     * @param options Register builder options
     * @returns Transaction signature
     */
    async registerBuilder(options) {
        const { admin, builderAuthority } = options;
        const [protocolStatePda] = (0, pda_1.findProtocolStatePda)();
        const [builderProfilePda] = (0, pda_1.findBuilderProfilePda)(builderAuthority);
        const tx = await this.program.methods
            .registerBuilder()
            .accounts({
            protocolState: protocolStatePda,
            builderProfile: builderProfilePda,
            builderAuthority,
            admin: admin.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .signers([admin])
            .rpc();
        return tx;
    }
    /**
     * Request a build
     * @param options Request build options
     * @returns Transaction signature and build request PDA
     */
    async requestBuild(options) {
        const { requester, spec, budgetLamports } = options;
        if (spec.length > 500) {
            throw new Error('Spec cannot exceed 500 characters');
        }
        const [protocolStatePda] = (0, pda_1.findProtocolStatePda)();
        const protocolState = await this.getProtocolState();
        const buildId = protocolState.buildCount;
        const [buildRequestPda] = (0, pda_1.findBuildRequestPda)(requester.publicKey, buildId);
        const [escrowPda] = (0, pda_1.findEscrowPda)(buildRequestPda);
        const budget = typeof budgetLamports === 'number' ? new anchor_1.BN(budgetLamports) : budgetLamports;
        const tx = await this.program.methods
            .requestBuild(spec, budget)
            .accounts({
            protocolState: protocolStatePda,
            buildRequest: buildRequestPda,
            escrow: escrowPda,
            requester: requester.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .signers([requester])
            .rpc();
        return {
            signature: tx,
            buildRequestPda,
            buildId,
        };
    }
    /**
     * Claim a build
     * @param options Claim build options
     * @returns Transaction signature
     */
    async claimBuild(options) {
        const { builder, buildRequestPda } = options;
        const [builderProfilePda] = (0, pda_1.findBuilderProfilePda)(builder.publicKey);
        const tx = await this.program.methods
            .claimBuild()
            .accounts({
            buildRequest: buildRequestPda,
            builderProfile: builderProfilePda,
            builder: builder.publicKey,
        })
            .signers([builder])
            .rpc();
        return tx;
    }
    /**
     * Log a build step
     * @param options Log build step options
     * @returns Transaction signature
     */
    async logBuildStep(options) {
        const { builder, buildRequestPda, stepType, description, contentHash } = options;
        if (description.length > 200) {
            throw new Error('Description cannot exceed 200 characters');
        }
        const buildRequest = await this.getBuildRequest(buildRequestPda);
        const [buildStepPda] = (0, pda_1.findBuildStepPda)(buildRequestPda, buildRequest.stepCount);
        // Convert contentHash to array if it's a Buffer
        const hashArray = Buffer.isBuffer(contentHash)
            ? Array.from(contentHash)
            : contentHash;
        if (hashArray.length !== 32) {
            throw new Error('Content hash must be exactly 32 bytes');
        }
        const tx = await this.program.methods
            .logBuildStep(stepType, description, hashArray)
            .accounts({
            buildRequest: buildRequestPda,
            buildStep: buildStepPda,
            builder: builder.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .signers([builder])
            .rpc();
        return tx;
    }
    /**
     * Complete a build
     * @param options Complete build options
     * @returns Transaction signature
     */
    async completeBuild(options) {
        const { builder, buildRequestPda, programId, success } = options;
        if (programId && programId.length > 50) {
            throw new Error('Program ID cannot exceed 50 characters');
        }
        const buildRequest = await this.getBuildRequest(buildRequestPda);
        const [protocolStatePda] = (0, pda_1.findProtocolStatePda)();
        const [builderProfilePda] = (0, pda_1.findBuilderProfilePda)(builder.publicKey);
        const [escrowPda] = (0, pda_1.findEscrowPda)(buildRequestPda);
        const protocolState = await this.getProtocolState();
        const tx = await this.program.methods
            .completeBuild(programId || null, success)
            .accounts({
            protocolState: protocolStatePda,
            buildRequest: buildRequestPda,
            builderProfile: builderProfilePda,
            escrow: escrowPda,
            builder: builder.publicKey,
            requester: buildRequest.requester,
            admin: protocolState.admin,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .signers([builder])
            .rpc();
        return tx;
    }
    /**
     * Get a build request account
     * @param buildRequestPda Build request PDA
     * @returns Build request account data
     */
    async getBuildRequest(buildRequestPda) {
        const accountInfo = await this.connection.getAccountInfo(buildRequestPda);
        if (!accountInfo) {
            throw new Error('Build request account not found');
        }
        const account = this.program.coder.accounts.decode('buildRequest', accountInfo.data);
        return account;
    }
    /**
     * Get protocol state
     * @returns Protocol state account data
     */
    async getProtocolState() {
        const [protocolStatePda] = (0, pda_1.findProtocolStatePda)();
        const accountInfo = await this.connection.getAccountInfo(protocolStatePda);
        if (!accountInfo) {
            throw new Error('Protocol state account not found');
        }
        const account = this.program.coder.accounts.decode('protocolState', accountInfo.data);
        return account;
    }
    /**
     * Get builder profile
     * @param builderAuthority Builder authority public key
     * @returns Builder profile account data
     */
    async getBuilderProfile(builderAuthority) {
        const [builderProfilePda] = (0, pda_1.findBuilderProfilePda)(builderAuthority);
        const accountInfo = await this.connection.getAccountInfo(builderProfilePda);
        if (!accountInfo) {
            throw new Error('Builder profile account not found');
        }
        const account = this.program.coder.accounts.decode('builderProfile', accountInfo.data);
        return account;
    }
    /**
     * Get a build step
     * @param buildRequestPda Build request PDA
     * @param stepNumber Step number (0-indexed)
     * @returns Build step account data
     */
    async getBuildStep(buildRequestPda, stepNumber) {
        const [buildStepPda] = (0, pda_1.findBuildStepPda)(buildRequestPda, stepNumber);
        const accountInfo = await this.connection.getAccountInfo(buildStepPda);
        if (!accountInfo) {
            throw new Error('Build step account not found');
        }
        const account = this.program.coder.accounts.decode('buildStep', accountInfo.data);
        return account;
    }
    /**
     * Get all builds (optionally filtered)
     * @param filter Optional filter criteria
     * @returns Array of build requests with their PDAs
     */
    async getAllBuilds(filter) {
        const filters = [];
        // Account discriminator for BuildRequest (first 8 bytes)
        filters.push({
            memcmp: {
                offset: 0,
                bytes: 'B9DwfXMZjwo', // Base58 of discriminator [7, 206, 240, 125, 25, 143, 138, 146]
            },
        });
        // Filter by requester (pubkey is at offset 8+8 = 16, after discriminator + id)
        if (filter?.requester) {
            filters.push({
                memcmp: {
                    offset: 16,
                    bytes: filter.requester.toBase58(),
                },
            });
        }
        // Filter by builder (pubkey is at offset 8+8+32 = 48, after discriminator + id + requester)
        // Note: This is an Option<Pubkey>, so we need to check if it's Some (first byte = 1)
        if (filter?.builder) {
            filters.push({
                memcmp: {
                    offset: 49, // Skip the Option discriminator byte
                    bytes: filter.builder.toBase58(),
                },
            });
        }
        const accounts = await this.connection.getProgramAccounts(this.programId, {
            filters,
        });
        // Deserialize accounts
        const buildRequests = accounts.map(({ pubkey, account }) => ({
            pubkey,
            account: this.program.coder.accounts.decode('buildRequest', account.data),
        }));
        // Apply status filter if provided (can't be done at RPC level)
        if (filter?.status) {
            const statusKey = Object.keys(filter.status)[0];
            return buildRequests.filter((br) => Object.keys(br.account.status)[0] === statusKey);
        }
        return buildRequests;
    }
    /**
     * Stream build progress from the engine (SSE)
     * This is a convenience method for connecting to the build engine's SSE endpoint
     * @param engineUrl The build engine's base URL
     * @param spec The build specification
     * @yields Build events as they occur
     */
    async *streamBuild(engineUrl, spec) {
        const url = `${engineUrl}/build/stream`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify({ spec }),
        });
        if (!response.ok) {
            throw new Error(`Failed to start build stream: ${response.statusText}`);
        }
        if (!response.body) {
            throw new Error('No response body');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            yield data;
                        }
                        catch (e) {
                            console.warn('Failed to parse SSE data:', line);
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
}
exports.SolForgeClient = SolForgeClient;
//# sourceMappingURL=client.js.map