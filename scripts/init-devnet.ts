import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import fs from 'fs';
import path from 'path';

const PROGRAM_ID = new PublicKey('5mZkFVLzZKcKLxPT7LqjLMti2rNWN5ybYazxhsQDAoJL');
const RPC_URL = 'https://api.devnet.solana.com';

async function main() {
  // Load keypair
  const keyPath = path.join(__dirname, '..', 'deploy-key.json');
  const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(keyData));
  
  console.log('Wallet:', wallet.publicKey.toBase58());
  
  const connection = new Connection(RPC_URL, 'confirmed');
  const balance = await connection.getBalance(wallet.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL');
  
  // Load IDL
  const idlPath = path.join(__dirname, '..', 'target', 'idl', 'solforge.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  
  // Create provider
  const provider = new AnchorProvider(
    connection,
    new Wallet(wallet),
    { commitment: 'confirmed' }
  );
  
  const program = new Program(idl, provider);
  
  // Find PDAs
  const [protocolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('protocol')],
    PROGRAM_ID
  );
  console.log('Protocol PDA:', protocolPda.toBase58());
  
  // Check if already initialized
  const existing = await connection.getAccountInfo(protocolPda);
  if (existing) {
    console.log('Protocol already initialized!');
  } else {
    // Initialize with 0% fee
    console.log('\n1. Initializing protocol...');
    const initTx = await program.methods
      .initialize(0) // 0 fee bps
      .accountsStrict({
        protocolState: protocolPda,
        admin: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    console.log('✅ Protocol initialized:', initTx);
    console.log(`   https://explorer.solana.com/tx/${initTx}?cluster=devnet`);
  }
  
  // Register builder
  const [builderPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('builder'), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );
  console.log('\nBuilder PDA:', builderPda.toBase58());
  
  const builderExisting = await connection.getAccountInfo(builderPda);
  if (builderExisting) {
    console.log('Builder already registered!');
  } else {
    console.log('\n2. Registering builder...');
    const regTx = await program.methods
      .registerBuilder()
      .accountsStrict({
        protocolState: protocolPda,
        builderProfile: builderPda,
        builderAuthority: wallet.publicKey,
        admin: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    console.log('✅ Builder registered:', regTx);
    console.log(`   https://explorer.solana.com/tx/${regTx}?cluster=devnet`);
  }
  
  // Verify
  console.log('\n--- Verification ---');
  const state = await (program.account as any).protocolState.fetch(protocolPda);
  console.log('Build count:', state.buildCount.toString());
  console.log('Admin:', state.admin.toBase58());
  console.log('Fee bps:', state.feeBps);
  
  const builder = await (program.account as any).builderProfile.fetch(builderPda);
  console.log('Builder active:', builder.active);
  console.log('Builds completed:', builder.buildsCompleted.toString());
  
  console.log('\n🎉 Devnet ready for chain-logged builds!');
}

main().catch(console.error);
