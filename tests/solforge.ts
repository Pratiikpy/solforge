import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solforge } from "../target/types/solforge";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("solforge", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solforge as Program<Solforge>;
  
  const admin = Keypair.generate();
  const requester = Keypair.generate();
  const builder = Keypair.generate();
  
  let protocolStatePda: PublicKey;
  let protocolStateBump: number;
  
  let builderProfilePda: PublicKey;
  let builderProfileBump: number;
  
  let buildRequestPda: PublicKey;
  let buildRequestBump: number;
  
  let escrowPda: PublicKey;
  let escrowBump: number;

  before(async () => {
    // Airdrop SOL to test accounts
    const airdropAmount = 5 * LAMPORTS_PER_SOL;
    
    const adminAirdrop = await provider.connection.requestAirdrop(
      admin.publicKey,
      airdropAmount
    );
    await provider.connection.confirmTransaction(adminAirdrop);
    
    const requesterAirdrop = await provider.connection.requestAirdrop(
      requester.publicKey,
      airdropAmount
    );
    await provider.connection.confirmTransaction(requesterAirdrop);
    
    const builderAirdrop = await provider.connection.requestAirdrop(
      builder.publicKey,
      airdropAmount
    );
    await provider.connection.confirmTransaction(builderAirdrop);

    // Calculate PDAs
    [protocolStatePda, protocolStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    [builderProfilePda, builderProfileBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("builder"), builder.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes protocol state", async () => {
    const feeBps = 500; // 5%
    
    const tx = await program.methods
      .initialize(feeBps)
      .accountsStrict({
        protocolState: protocolStatePda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    console.log("Initialize tx:", tx);

    const protocolState = await program.account.protocolState.fetch(protocolStatePda);
    
    expect(protocolState.admin.toString()).to.equal(admin.publicKey.toString());
    expect(protocolState.feeBps).to.equal(feeBps);
    expect(protocolState.buildCount.toString()).to.equal("0");
    expect(protocolState.totalBuildsCompleted.toString()).to.equal("0");
    expect(protocolState.totalSolEarned.toString()).to.equal("0");
  });

  it("Registers a builder", async () => {
    const tx = await program.methods
      .registerBuilder()
      .accountsStrict({
        protocolState: protocolStatePda,
        builderProfile: builderProfilePda,
        builderAuthority: builder.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    console.log("Register builder tx:", tx);

    const builderProfile = await program.account.builderProfile.fetch(builderProfilePda);
    
    expect(builderProfile.authority.toString()).to.equal(builder.publicKey.toString());
    expect(builderProfile.buildsCompleted.toString()).to.equal("0");
    expect(builderProfile.buildsFailed.toString()).to.equal("0");
    expect(builderProfile.totalEarned.toString()).to.equal("0");
    expect(builderProfile.active).to.be.true;
  });

  it("Requests a build", async () => {
    const spec = "Build a simple counter program with increment and decrement instructions";
    const budget = 1 * LAMPORTS_PER_SOL;
    
    const protocolState = await program.account.protocolState.fetch(protocolStatePda);
    const buildCount = protocolState.buildCount;

    [buildRequestPda, buildRequestBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("build"),
        requester.publicKey.toBuffer(),
        buildCount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    [escrowPda, escrowBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), buildRequestPda.toBuffer()],
      program.programId
    );

    const requesterBalanceBefore = await provider.connection.getBalance(requester.publicKey);

    const tx = await program.methods
      .requestBuild(spec, new anchor.BN(budget))
      .accountsStrict({
        protocolState: protocolStatePda,
        buildRequest: buildRequestPda,
        escrow: escrowPda,
        requester: requester.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([requester])
      .rpc();

    console.log("Request build tx:", tx);

    const buildRequest = await program.account.buildRequest.fetch(buildRequestPda);
    
    expect(buildRequest.id.toString()).to.equal(buildCount.toString());
    expect(buildRequest.requester.toString()).to.equal(requester.publicKey.toString());
    expect(buildRequest.builder).to.be.null;
    expect(buildRequest.spec).to.equal(spec);
    expect(buildRequest.budget.toString()).to.equal(budget.toString());
    expect(buildRequest.status).to.deep.equal({ pending: {} });
    expect(buildRequest.stepCount).to.equal(0);

    const escrowBalance = await provider.connection.getBalance(escrowPda);
    expect(escrowBalance).to.equal(budget);

    const updatedProtocolState = await program.account.protocolState.fetch(protocolStatePda);
    expect(updatedProtocolState.buildCount.toString()).to.equal((buildCount.toNumber() + 1).toString());
  });

  it("Claims a build", async () => {
    const tx = await program.methods
      .claimBuild()
      .accountsStrict({
        buildRequest: buildRequestPda,
        builderProfile: builderProfilePda,
        builder: builder.publicKey,
      })
      .signers([builder])
      .rpc();

    console.log("Claim build tx:", tx);

    const buildRequest = await program.account.buildRequest.fetch(buildRequestPda);
    
    expect(buildRequest.builder.toString()).to.equal(builder.publicKey.toString());
    expect(buildRequest.status).to.deep.equal({ inProgress: {} });
  });

  it("Logs build steps", async () => {
    const steps = [
      {
        stepType: { analyze: {} },
        description: "Analyzed requirements and designed program structure",
        contentHash: Buffer.from("a".repeat(64), "hex"),
      },
      {
        stepType: { generateCode: {} },
        description: "Generated Anchor program code with all instructions",
        contentHash: Buffer.from("b".repeat(64), "hex"),
      },
      {
        stepType: { compile: {} },
        description: "Compiled program successfully",
        contentHash: Buffer.from("c".repeat(64), "hex"),
      },
      {
        stepType: { test: {} },
        description: "Ran all tests - 100% pass rate",
        contentHash: Buffer.from("d".repeat(64), "hex"),
      },
      {
        stepType: { deploy: {} },
        description: "Deployed to devnet",
        contentHash: Buffer.from("e".repeat(64), "hex"),
      },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      const [buildStepPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("step"),
          buildRequestPda.toBuffer(),
          Buffer.from([i, 0, 0, 0]), // u32 in little-endian
        ],
        program.programId
      );

      const tx = await program.methods
        .logBuildStep(
          step.stepType,
          step.description,
          Array.from(step.contentHash)
        )
        .accountsStrict({
          buildRequest: buildRequestPda,
          buildStep: buildStepPda,
          builder: builder.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([builder])
        .rpc();

      console.log(`Log step ${i} tx:`, tx);

      const buildStep = await program.account.buildStep.fetch(buildStepPda);
      
      expect(buildStep.stepNumber).to.equal(i);
      expect(buildStep.description).to.equal(step.description);
      expect(Buffer.from(buildStep.contentHash)).to.deep.equal(step.contentHash);
    }

    const buildRequest = await program.account.buildRequest.fetch(buildRequestPda);
    expect(buildRequest.stepCount).to.equal(steps.length);
  });

  it("Completes build successfully", async () => {
    const programId = "Counter1111111111111111111111111111111111111";
    
    const builderBalanceBefore = await provider.connection.getBalance(builder.publicKey);
    const adminBalanceBefore = await provider.connection.getBalance(admin.publicKey);
    const escrowBalanceBefore = await provider.connection.getBalance(escrowPda);

    const tx = await program.methods
      .completeBuild(programId, true)
      .accountsStrict({
        protocolState: protocolStatePda,
        buildRequest: buildRequestPda,
        builderProfile: builderProfilePda,
        escrow: escrowPda,
        builder: builder.publicKey,
        requester: requester.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([builder])
      .rpc();

    console.log("Complete build tx:", tx);

    const buildRequest = await program.account.buildRequest.fetch(buildRequestPda);
    
    expect(buildRequest.status).to.deep.equal({ completed: {} });
    expect(buildRequest.deployedProgramId).to.equal(programId);
    expect(buildRequest.completedAt.toNumber()).to.be.greaterThan(0);

    // Check payments
    const protocolState = await program.account.protocolState.fetch(protocolStatePda);
    const expectedFee = Math.floor((escrowBalanceBefore * protocolState.feeBps) / 10000);
    const expectedBuilderAmount = escrowBalanceBefore - expectedFee;

    const builderBalanceAfter = await provider.connection.getBalance(builder.publicKey);
    const adminBalanceAfter = await provider.connection.getBalance(admin.publicKey);
    const escrowBalanceAfter = await provider.connection.getBalance(escrowPda);

    expect(builderBalanceAfter).to.be.approximately(builderBalanceBefore + expectedBuilderAmount, 10000);
    expect(adminBalanceAfter).to.be.approximately(adminBalanceBefore + expectedFee, 10000);
    expect(escrowBalanceAfter).to.equal(0);

    // Check stats
    const updatedProtocolState = await program.account.protocolState.fetch(protocolStatePda);
    expect(updatedProtocolState.totalBuildsCompleted.toString()).to.equal("1");
    expect(updatedProtocolState.totalSolEarned.toNumber()).to.be.approximately(expectedFee, 10000);

    const builderProfile = await program.account.builderProfile.fetch(builderProfilePda);
    expect(builderProfile.buildsCompleted.toString()).to.equal("1");
    expect(builderProfile.totalEarned.toNumber()).to.be.approximately(expectedBuilderAmount, 10000);
  });

  it("Handles failed build with refund", async () => {
    const spec = "Build a complex DeFi protocol";
    const budget = 2 * LAMPORTS_PER_SOL;
    
    const protocolState = await program.account.protocolState.fetch(protocolStatePda);
    const buildCount = protocolState.buildCount;

    const [newBuildRequestPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("build"),
        requester.publicKey.toBuffer(),
        buildCount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [newEscrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), newBuildRequestPda.toBuffer()],
      program.programId
    );

    // Request build
    await program.methods
      .requestBuild(spec, new anchor.BN(budget))
      .accountsStrict({
        protocolState: protocolStatePda,
        buildRequest: newBuildRequestPda,
        escrow: newEscrowPda,
        requester: requester.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([requester])
      .rpc();

    // Claim build
    await program.methods
      .claimBuild()
      .accountsStrict({
        buildRequest: newBuildRequestPda,
        builderProfile: builderProfilePda,
        builder: builder.publicKey,
      })
      .signers([builder])
      .rpc();

    const requesterBalanceBefore = await provider.connection.getBalance(requester.publicKey);

    // Complete build as failed
    const tx = await program.methods
      .completeBuild(null, false)
      .accountsStrict({
        protocolState: protocolStatePda,
        buildRequest: newBuildRequestPda,
        builderProfile: builderProfilePda,
        escrow: newEscrowPda,
        builder: builder.publicKey,
        requester: requester.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([builder])
      .rpc();

    console.log("Complete failed build tx:", tx);

    const buildRequest = await program.account.buildRequest.fetch(newBuildRequestPda);
    expect(buildRequest.status).to.deep.equal({ failed: {} });
    expect(buildRequest.deployedProgramId).to.be.null;

    // Check refund
    const requesterBalanceAfter = await provider.connection.getBalance(requester.publicKey);
    expect(requesterBalanceAfter).to.be.approximately(requesterBalanceBefore + budget, 10000);

    // Check builder stats
    const builderProfile = await program.account.builderProfile.fetch(builderProfilePda);
    expect(builderProfile.buildsFailed.toString()).to.equal("1");
  });

  it("Prevents unauthorized claim", async () => {
    const spec = "Another build request";
    const budget = 0.5 * LAMPORTS_PER_SOL;
    
    const protocolState = await program.account.protocolState.fetch(protocolStatePda);
    const buildCount = protocolState.buildCount;

    const [newBuildRequestPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("build"),
        requester.publicKey.toBuffer(),
        buildCount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [newEscrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), newBuildRequestPda.toBuffer()],
      program.programId
    );

    await program.methods
      .requestBuild(spec, new anchor.BN(budget))
      .accountsStrict({
        protocolState: protocolStatePda,
        buildRequest: newBuildRequestPda,
        escrow: newEscrowPda,
        requester: requester.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([requester])
      .rpc();

    // Try to claim with unauthorized builder
    const unauthorizedBuilder = Keypair.generate();
    const [unauthorizedProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("builder"), unauthorizedBuilder.publicKey.toBuffer()],
      program.programId
    );

    await provider.connection.requestAirdrop(
      unauthorizedBuilder.publicKey,
      LAMPORTS_PER_SOL
    );
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      await program.methods
        .claimBuild()
        .accountsStrict({
          buildRequest: newBuildRequestPda,
          builderProfile: unauthorizedProfilePda,
          builder: unauthorizedBuilder.publicKey,
        })
        .signers([unauthorizedBuilder])
        .rpc();
      
      expect.fail("Should have thrown error");
    } catch (err) {
      expect(err.message).to.include("AccountNotInitialized");
    }
  });

  it("Prevents spec too long", async () => {
    const longSpec = "a".repeat(501);
    const budget = 1 * LAMPORTS_PER_SOL;
    
    const protocolState = await program.account.protocolState.fetch(protocolStatePda);
    const buildCount = protocolState.buildCount;

    const [newBuildRequestPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("build"),
        requester.publicKey.toBuffer(),
        buildCount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [newEscrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), newBuildRequestPda.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .requestBuild(longSpec, new anchor.BN(budget))
        .accountsStrict({
          protocolState: protocolStatePda,
          buildRequest: newBuildRequestPda,
          escrow: newEscrowPda,
          requester: requester.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([requester])
        .rpc();
      
      expect.fail("Should have thrown error");
    } catch (err) {
      expect(err.message).to.include("SpecTooLong");
    }
  });
});
