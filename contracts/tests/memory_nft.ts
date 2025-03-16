import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { MemoryNft } from "../target/types/memory_nft";
import { expect } from "chai";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

describe("memory_nft", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MemoryNft as Program<MemoryNft>;
  const wallet = provider.wallet;

  let memoryDataPDA: PublicKey;
  let memoryDataBump: number;
  
  let mintKeypair: Keypair;
  let memoryPDA: PublicKey;
  let memoryBump: number;

  before(async () => {
    // Find the program derived address for memory data
    [memoryDataPDA, memoryDataBump] = await PublicKey.findProgramAddress(
      [Buffer.from("memory_data")],
      program.programId
    );
  });

  it("Initializes the memory NFT program", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: wallet.publicKey,
        memoryData: memoryDataPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log("Initialize transaction signature", tx);
    
    // Fetch the memory data account
    const memoryData = await program.account.memoryData.fetch(memoryDataPDA);
    
    // Verify memory data was initialized correctly
    expect(memoryData.authority.toString()).to.equal(wallet.publicKey.toString());
    expect(memoryData.memoryCount.toNumber()).to.equal(0);
    expect(memoryData.bump).to.equal(memoryDataBump);
  });

  it("Mints a new memory NFT", async () => {
    // Generate a new keypair for the mint account
    mintKeypair = Keypair.generate();
    
    // Find the PDA for memory
    [memoryPDA, memoryBump] = await PublicKey.findProgramAddress(
      [Buffer.from("memory"), mintKeypair.publicKey.toBuffer()],
      program.programId
    );
    
    // Create associated token account for the mint and wallet
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey
    );
    
    // Prepare test memory data
    const uri = "https://arweave.net/memory-data-uri";
    const name = "Test Memory";
    const symbol = "TMEM";
    const memoryType = "cognitive";
    const memoryQuality = 3;
    const neuralFingerprint = "unique-neural-fingerprint-hash";
    const timestamp = Math.floor(Date.now() / 1000);
    
    const tx = await program.methods
      .mintMemory(
        uri,
        name,
        symbol,
        memoryType,
        memoryQuality,
        neuralFingerprint,
        new BN(timestamp)
      )
      .accounts({
        authority: wallet.publicKey,
        memoryData: memoryDataPDA,
        memory: memoryPDA,
        mint: mintKeypair.publicKey,
        tokenAccount: associatedTokenAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();
    
    console.log("Mint memory transaction signature", tx);
    
    // Fetch the memory account
    const memory = await program.account.memory.fetch(memoryPDA);
    
    // Verify memory was initialized correctly
    expect(memory.owner.toString()).to.equal(wallet.publicKey.toString());
    expect(memory.mint.toString()).to.equal(mintKeypair.publicKey.toString());
    expect(memory.memoryType).to.equal(memoryType);
    expect(memory.quality).to.equal(memoryQuality);
    expect(memory.neuralFingerprint).to.equal(neuralFingerprint);
    expect(memory.createdAt.toNumber()).to.equal(timestamp);
    expect(memory.isTransferable).to.equal(true);
    expect(memory.bump).to.equal(memoryBump);
    
    // Fetch the memory data account to check if count was incremented
    const memoryData = await program.account.memoryData.fetch(memoryDataPDA);
    expect(memoryData.memoryCount.toNumber()).to.equal(1);
  });

  it("Toggles memory transferability", async () => {
    const tx = await program.methods
      .toggleTransferable(false)
      .accounts({
        authority: wallet.publicKey,
        memory: memoryPDA,
        mint: mintKeypair.publicKey,
      })
      .rpc();
    
    console.log("Toggle transferable transaction signature", tx);
    
    // Fetch the memory account
    let memory = await program.account.memory.fetch(memoryPDA);
    
    // Verify transferability was toggled off
    expect(memory.isTransferable).to.equal(false);
    
    // Toggle it back on
    const tx2 = await program.methods
      .toggleTransferable(true)
      .accounts({
        authority: wallet.publicKey,
        memory: memoryPDA,
        mint: mintKeypair.publicKey,
      })
      .rpc();
    
    console.log("Toggle transferable transaction signature", tx2);
    
    // Fetch the memory account again
    memory = await program.account.memory.fetch(memoryPDA);
    
    // Verify transferability was toggled back on
    expect(memory.isTransferable).to.equal(true);
  });

  it("Transfers a memory NFT to a new owner", async () => {
    // Generate a new keypair to act as the new owner
    const newOwnerKeypair = Keypair.generate();
    
    // Airdrop SOL to the new owner for transaction fees
    const airdropTx = await provider.connection.requestAirdrop(
      newOwnerKeypair.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx);
    
    // Create associated token account for the mint and new owner
    const newOwnerTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      newOwnerKeypair.publicKey
    );
    
    // Current owner's token account
    const currentOwnerTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey
    );
    
    const tx = await program.methods
      .transferMemory()
      .accounts({
        authority: wallet.publicKey,
        newOwner: newOwnerKeypair.publicKey,
        memory: memoryPDA,
        mint: mintKeypair.publicKey,
        fromTokenAccount: currentOwnerTokenAccount,
        toTokenAccount: newOwnerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
    
    console.log("Transfer memory transaction signature", tx);
    
    // Fetch the memory account
    const memory = await program.account.memory.fetch(memoryPDA);
    
    // Verify memory owner was updated
    expect(memory.owner.toString()).to.equal(newOwnerKeypair.publicKey.toString());
  });

  it("Rejects transfer of a non-transferable memory", async () => {
    // Create a new mint for this test
    const newMintKeypair = Keypair.generate();
    
    // Find the PDA for this memory
    const [memoryPda, memoryBump] = await PublicKey.findProgramAddress(
      [Buffer.from("memory"), newMintKeypair.publicKey.toBuffer()],
      program.programId
    );
    
    // Create token account
    const tokenAccount = await getAssociatedTokenAddress(
      newMintKeypair.publicKey,
      wallet.publicKey
    );
    
    // Mint a new non-transferable memory
    await program.methods
      .mintMemory(
        "Non-transferable Memory",
        "NTMEM",
        "https://arweave.net/memory-data-uri",
        "emotional",
        "common",
        "0xabcdef1234567890",
        new BN(Math.floor(Date.now() / 1000))
      )
      .accounts({
        memory: memoryPda,
        memoryData: memoryDataPDA,
        mint: newMintKeypair.publicKey,
        tokenAccount: tokenAccount,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([newMintKeypair])
      .rpc();
    
    // Set transferable to false
    await program.methods
      .setTransferable(false)
      .accounts({
        memory: memoryPda,
        owner: wallet.publicKey,
      })
      .rpc();
    
    // Create new recipient keypair
    const recipient = Keypair.generate();
    await provider.connection.requestAirdrop(
      recipient.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    
    // Create recipient token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      newMintKeypair.publicKey,
      recipient.publicKey
    );
    
    const tx = new Transaction();
    tx.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        recipientTokenAccount,
        recipient.publicKey,
        newMintKeypair.publicKey
      )
    );
    await sendAndConfirmTransaction(provider.connection, tx, [wallet.payer]);
    
    // Try to transfer - should fail
    try {
      await program.methods
        .transferMemory()
        .accounts({
          memory: memoryPda,
          mint: newMintKeypair.publicKey,
          fromTokenAccount: tokenAccount,
          toTokenAccount: recipientTokenAccount,
          fromOwner: wallet.publicKey,
          toOwner: recipient.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      // If we reach here, the transfer did not fail
      expect.fail("Transfer of non-transferable memory should have failed");
    } catch (error) {
      // Verify it's the correct error
      expect(error.toString()).to.include("Memory is not transferable");
    }
  });

  it("Updates memory URI", async () => {
    // Find the PDA for the first memory we created
    const [memoryPda, _] = await PublicKey.findProgramAddress(
      [Buffer.from("memory"), mintKeypair.publicKey.toBuffer()],
      program.programId
    );
    
    // New URI for the memory
    const newUri = "https://ipfs.io/ipfs/newContentHash";
    
    // Update the memory URI
    await program.methods
      .updateMemoryUri(newUri)
      .accounts({
        memory: memoryPda,
        owner: wallet.publicKey,
      })
      .rpc();
    
    // Verify the memory URI was updated
    const memory = await program.account.memory.fetch(memoryPda);
    expect(memory.uri).to.equal(newUri);
  });

  it("Burns a memory NFT", async () => {
    // Create a new mint for this test
    const burnMintKeypair = Keypair.generate();
    
    // Find the PDA for this memory
    const [memoryPda, memoryBump] = await PublicKey.findProgramAddress(
      [Buffer.from("memory"), burnMintKeypair.publicKey.toBuffer()],
      program.programId
    );
    
    // Create token account
    const tokenAccount = await getAssociatedTokenAddress(
      burnMintKeypair.publicKey,
      wallet.publicKey
    );
    
    // Mint a new memory for burning
    await program.methods
      .mintMemory(
        "Burn Test Memory",
        "BURN",
        "https://arweave.net/memory-data-uri",
        "therapeutic",
        "legendary",
        "0xdeadbeef",
        new BN(Math.floor(Date.now() / 1000))
      )
      .accounts({
        memory: memoryPda,
        memoryData: memoryDataPDA,
        mint: burnMintKeypair.publicKey,
        tokenAccount: tokenAccount,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([burnMintKeypair])
      .rpc();
    
    // Get the initial count of memories
    const memoryDataBefore = await program.account.memoryData.fetch(memoryDataPDA);
    const initialCount = memoryDataBefore.memoryCount.toNumber();
    
    // Burn the memory NFT
    await program.methods
      .burnMemory()
      .accounts({
        memory: memoryPda,
        mint: burnMintKeypair.publicKey,
        tokenAccount: tokenAccount,
        owner: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        memoryData: memoryDataPDA,
      })
      .rpc();
    
    // Try to fetch the memory - should fail as it's closed
    try {
      await program.account.memory.fetch(memoryPda);
      expect.fail("Memory account should have been closed");
    } catch (error) {
      // This is expected
      expect(error.toString()).to.include("Account does not exist");
    }
    
    // Verify the memory count was decremented
    const memoryDataAfter = await program.account.memoryData.fetch(memoryDataPDA);
    expect(memoryDataAfter.memoryCount.toNumber()).to.equal(initialCount - 1);
  });
}); 