import * as anchor from '@project-serum/anchor';
import { Program, BN } from '@project-serum/anchor';
import { MemoryValidator } from '../target/types/memory_validator';
import { expect } from 'chai';
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createMint,
  mintTo,
  createAssociatedTokenAccount,
} from '@solana/spl-token';

describe('memory_validator', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MemoryValidator as Program<MemoryValidator>;
  const wallet = provider.wallet;
  
  // Constants for testing
  const MIN_STAKE_AMOUNT = new BN(100_000_000); // 0.1 SOL
  const REWARD_PER_VALIDATION = new BN(5_000_000); // 0.005 SOL
  const VALIDATION_THRESHOLD = 3; // Number of validations needed
  
  // Test data
  let validatorConfigPda: PublicKey;
  let validatorConfigBump: number;
  let validatorPda: PublicKey;
  let validatorBump: number;
  let validationPda: PublicKey;
  let validationBump: number;
  let mockMemoryMint: PublicKey;
  let mockMemoryId: string;
  
  // Test validators
  const validator1 = wallet; // Use provider wallet as first validator
  const validator2 = Keypair.generate();
  const validator3 = Keypair.generate();
  const validator4 = Keypair.generate();
  
  before(async () => {
    // Find the program derived address for validator config
    [validatorConfigPda, validatorConfigBump] = await PublicKey.findProgramAddress(
      [Buffer.from("validator_config")],
      program.programId
    );
    
    // Create a mock memory mint for testing
    mockMemoryMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      0
    );
    
    mockMemoryId = mockMemoryMint.toString();
    
    // Fund the test validators
    for (const validator of [validator2, validator3, validator4]) {
      const airdropSig = await provider.connection.requestAirdrop(
        validator.publicKey,
        2 * LAMPORTS_PER_SOL // 2 SOL
      );
      await provider.connection.confirmTransaction(airdropSig);
    }
  });

  it("Initializes the validator program", async () => {
    const tx = await program.methods
      .initialize(
        MIN_STAKE_AMOUNT,
        REWARD_PER_VALIDATION,
        VALIDATION_THRESHOLD
      )
      .accounts({
        validatorConfig: validatorConfigPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Fetch the validator config account
    const validatorConfig = await program.account.validatorConfig.fetch(validatorConfigPda);
    
    // Verify the validator config was initialized correctly
    expect(validatorConfig.authority.toString()).to.equal(wallet.publicKey.toString());
    expect(validatorConfig.minStakeAmount.toString()).to.equal(MIN_STAKE_AMOUNT.toString());
    expect(validatorConfig.rewardPerValidation.toString()).to.equal(REWARD_PER_VALIDATION.toString());
    expect(validatorConfig.validationThreshold).to.equal(VALIDATION_THRESHOLD);
    expect(validatorConfig.bump).to.equal(validatorConfigBump);
    expect(validatorConfig.validatorCount.toNumber()).to.equal(0);
  });

  it("Registers validators successfully", async () => {
    // First, register the main wallet as validator1
    [validatorPda, validatorBump] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator1.publicKey.toBuffer()],
      program.programId
    );
    
    await program.methods
      .registerValidator()
      .accounts({
        validator: validatorPda,
        validatorConfig: validatorConfigPda,
        authority: validator1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    // Verify validator was registered
    let validatorAccount = await program.account.validator.fetch(validatorPda);
    expect(validatorAccount.authority.toString()).to.equal(validator1.publicKey.toString());
    expect(validatorAccount.active).to.be.true;
    expect(validatorAccount.stake.toString()).to.equal(MIN_STAKE_AMOUNT.toString());
    expect(validatorAccount.validationsSubmitted.toNumber()).to.equal(0);
    expect(validatorAccount.validationsProcessed.toNumber()).to.equal(0);
    expect(validatorAccount.pendingRewards.toString()).to.equal("0");
    
    // Verify validator count increased
    let validatorConfig = await program.account.validatorConfig.fetch(validatorConfigPda);
    expect(validatorConfig.validatorCount.toNumber()).to.equal(1);
    
    // Now register validator2
    const [validator2Pda, validator2Bump] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator2.publicKey.toBuffer()],
      program.programId
    );
    
    await program.methods
      .registerValidator()
      .accounts({
        validator: validator2Pda,
        validatorConfig: validatorConfigPda,
        authority: validator2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([validator2])
      .rpc();
    
    // Verify validator2 was registered
    validatorAccount = await program.account.validator.fetch(validator2Pda);
    expect(validatorAccount.authority.toString()).to.equal(validator2.publicKey.toString());
    expect(validatorAccount.active).to.be.true;
    
    // Verify validator count increased again
    validatorConfig = await program.account.validatorConfig.fetch(validatorConfigPda);
    expect(validatorConfig.validatorCount.toNumber()).to.equal(2);
    
    // Register validator3
    const [validator3Pda, validator3Bump] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator3.publicKey.toBuffer()],
      program.programId
    );
    
    await program.methods
      .registerValidator()
      .accounts({
        validator: validator3Pda,
        validatorConfig: validatorConfigPda,
        authority: validator3.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([validator3])
      .rpc();
    
    // Register validator4
    const [validator4Pda, validator4Bump] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator4.publicKey.toBuffer()],
      program.programId
    );
    
    await program.methods
      .registerValidator()
      .accounts({
        validator: validator4Pda,
        validatorConfig: validatorConfigPda,
        authority: validator4.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([validator4])
      .rpc();
    
    // Verify we now have 4 validators
    validatorConfig = await program.account.validatorConfig.fetch(validatorConfigPda);
    expect(validatorConfig.validatorCount.toNumber()).to.equal(4);
  });

  it("Submits validations for a memory", async () => {
    // Generate a unique validation ID
    const validationId = Keypair.generate().publicKey.toString();
    
    // Find the validation PDA
    [validationPda, validationBump] = await PublicKey.findProgramAddress(
      [Buffer.from("validation"), mockMemoryId, validationId],
      program.programId
    );
    
    // Find validator PDAs
    const [validator1Pda, _] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator1.publicKey.toBuffer()],
      program.programId
    );
    
    const [validator2Pda, __] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator2.publicKey.toBuffer()],
      program.programId
    );
    
    const [validator3Pda, ___] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator3.publicKey.toBuffer()],
      program.programId
    );
    
    // Submit validation from validator1
    await program.methods
      .submitValidation(
        mockMemoryId,
        validationId,
        "0x1234567890",  // Neural fingerprint
        "excellent", // Quality score
        "This is an authentic memory", // Description
        new BN(Date.now())
      )
      .accounts({
        validation: validationPda,
        validator: validator1Pda,
        authority: validator1.publicKey,
        validatorConfig: validatorConfigPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    // Verify validation was created
    let validation = await program.account.validation.fetch(validationPda);
    expect(validation.memoryId).to.equal(mockMemoryId);
    expect(validation.validationId).to.equal(validationId);
    expect(validation.neuralFingerprint).to.equal("0x1234567890");
    expect(validation.quality).to.equal("excellent");
    expect(validation.description).to.equal("This is an authentic memory");
    expect(validation.processed).to.be.false;
    expect(validation.validators.length).to.equal(1);
    expect(validation.validators[0].toString()).to.equal(validator1.publicKey.toString());
    
    // Validator1's stats should be updated
    let validator1Account = await program.account.validator.fetch(validator1Pda);
    expect(validator1Account.validationsSubmitted.toNumber()).to.equal(1);
    
    // Now validator2 submits validation for the same memory
    await program.methods
      .submitValidation(
        mockMemoryId,
        validationId,
        "0x1234567890",  // Same neural fingerprint
        "excellent", // Same quality score
        "Verified authentic memory", // Different description
        new BN(Date.now())
      )
      .accounts({
        validation: validationPda,
        validator: validator2Pda,
        authority: validator2.publicKey,
        validatorConfig: validatorConfigPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([validator2])
      .rpc();
    
    // Verify validation was updated
    validation = await program.account.validation.fetch(validationPda);
    expect(validation.validators.length).to.equal(2);
    expect(validation.validators[1].toString()).to.equal(validator2.publicKey.toString());
    
    // Validator2's stats should be updated
    let validator2Account = await program.account.validator.fetch(validator2Pda);
    expect(validator2Account.validationsSubmitted.toNumber()).to.equal(1);
    
    // Now validator3 submits validation, which should meet the threshold
    await program.methods
      .submitValidation(
        mockMemoryId,
        validationId,
        "0x1234567890",  // Same neural fingerprint
        "excellent", // Same quality score
        "Confirmed authenticity", // Different description
        new BN(Date.now())
      )
      .accounts({
        validation: validationPda,
        validator: validator3Pda,
        authority: validator3.publicKey,
        validatorConfig: validatorConfigPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([validator3])
      .rpc();
    
    // Verify validation was updated
    validation = await program.account.validation.fetch(validationPda);
    expect(validation.validators.length).to.equal(3);
    expect(validation.validators[2].toString()).to.equal(validator3.publicKey.toString());
    
    // Validator3's stats should be updated
    let validator3Account = await program.account.validator.fetch(validator3Pda);
    expect(validator3Account.validationsSubmitted.toNumber()).to.equal(1);
  });

  it("Processes validations and rewards validators", async () => {
    // Find validator PDAs
    const [validator1Pda, _] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator1.publicKey.toBuffer()],
      program.programId
    );
    
    const [validator2Pda, __] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator2.publicKey.toBuffer()],
      program.programId
    );
    
    const [validator3Pda, ___] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator3.publicKey.toBuffer()],
      program.programId
    );
    
    // Process the validation
    await program.methods
      .processValidation(mockMemoryId, validationPda)
      .accounts({
        validation: validationPda,
        validatorConfig: validatorConfigPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    // Verify validation is marked as processed
    const validation = await program.account.validation.fetch(validationPda);
    expect(validation.processed).to.be.true;
    
    // Check that validators received their rewards
    const validator1Account = await program.account.validator.fetch(validator1Pda);
    expect(validator1Account.validationsProcessed.toNumber()).to.equal(1);
    expect(validator1Account.pendingRewards.toString()).to.equal(REWARD_PER_VALIDATION.toString());
    
    const validator2Account = await program.account.validator.fetch(validator2Pda);
    expect(validator2Account.validationsProcessed.toNumber()).to.equal(1);
    expect(validator2Account.pendingRewards.toString()).to.equal(REWARD_PER_VALIDATION.toString());
    
    const validator3Account = await program.account.validator.fetch(validator3Pda);
    expect(validator3Account.validationsProcessed.toNumber()).to.equal(1);
    expect(validator3Account.pendingRewards.toString()).to.equal(REWARD_PER_VALIDATION.toString());
  });

  it("Claims validator rewards", async () => {
    // Find validator1's PDA
    const [validator1Pda, _] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator1.publicKey.toBuffer()],
      program.programId
    );
    
    // Get validator's initial balance
    const initialBalance = await provider.connection.getBalance(validator1.publicKey);
    
    // Claim rewards
    await program.methods
      .claimRewards()
      .accounts({
        validator: validator1Pda,
        validatorConfig: validatorConfigPda,
        authority: validator1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    // Verify rewards were claimed
    const validator1Account = await program.account.validator.fetch(validator1Pda);
    expect(validator1Account.pendingRewards.toString()).to.equal("0");
    
    // Check that balance increased
    const finalBalance = await provider.connection.getBalance(validator1.publicKey);
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("Updates validator config parameters", async () => {
    const newMinStake = new BN(200_000_000); // 0.2 SOL
    const newReward = new BN(10_000_000); // 0.01 SOL
    const newThreshold = 5;
    
    await program.methods
      .updateValidatorConfig(
        newMinStake,
        newReward,
        newThreshold
      )
      .accounts({
        validatorConfig: validatorConfigPda,
        authority: wallet.publicKey,
      })
      .rpc();
    
    // Verify config was updated
    const validatorConfig = await program.account.validatorConfig.fetch(validatorConfigPda);
    expect(validatorConfig.minStakeAmount.toString()).to.equal(newMinStake.toString());
    expect(validatorConfig.rewardPerValidation.toString()).to.equal(newReward.toString());
    expect(validatorConfig.validationThreshold).to.equal(newThreshold);
  });

  it("Allows validators to unstake and become inactive", async () => {
    // Find validator2's PDA
    const [validator2Pda, _] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator2.publicKey.toBuffer()],
      program.programId
    );
    
    // Get initial balance
    const initialBalance = await provider.connection.getBalance(validator2.publicKey);
    
    // Unstake
    await program.methods
      .unstake()
      .accounts({
        validator: validator2Pda,
        validatorConfig: validatorConfigPda,
        authority: validator2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([validator2])
      .rpc();
    
    // Verify validator is now inactive
    const validator2Account = await program.account.validator.fetch(validator2Pda);
    expect(validator2Account.active).to.be.false;
    expect(validator2Account.stake.toString()).to.equal("0");
    
    // Check that balance increased by stake amount
    const finalBalance = await provider.connection.getBalance(validator2.publicKey);
    expect(finalBalance).to.be.gt(initialBalance);
    
    // Verify validator count decreased
    const validatorConfig = await program.account.validatorConfig.fetch(validatorConfigPda);
    expect(validatorConfig.validatorCount.toNumber()).to.equal(3); // Down from 4
  });

  it("Prevents inactive validators from submitting validations", async () => {
    // Generate a unique validation ID
    const newValidationId = Keypair.generate().publicKey.toString();
    
    // Find the validation PDA
    const [newValidationPda, _] = await PublicKey.findProgramAddress(
      [Buffer.from("validation"), mockMemoryId, newValidationId],
      program.programId
    );
    
    // Find validator2's PDA (the inactive validator)
    const [validator2Pda, __] = await PublicKey.findProgramAddress(
      [Buffer.from("validator"), validator2.publicKey.toBuffer()],
      program.programId
    );
    
    // Try to submit validation as inactive validator (should fail)
    try {
      await program.methods
        .submitValidation(
          mockMemoryId,
          newValidationId,
          "0x9876543210",  // Neural fingerprint
          "common", // Quality score
          "This should fail", // Description
          new BN(Date.now())
        )
        .accounts({
          validation: newValidationPda,
          validator: validator2Pda,
          authority: validator2.publicKey,
          validatorConfig: validatorConfigPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([validator2])
        .rpc();
      
      // If we reach here, the validation did not fail as expected
      expect.fail("Validation from inactive validator should have failed");
    } catch (error) {
      // Verify it's the correct error
      expect(error.toString()).to.include("Validator is not active");
    }
  });
}); 