use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod memory_validator {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let validator_config = &mut ctx.accounts.validator_config;
        validator_config.authority = ctx.accounts.authority.key();
        validator_config.staking_token_mint = ctx.accounts.staking_token_mint.key();
        validator_config.reward_token_mint = ctx.accounts.reward_token_mint.key();
        validator_config.validator_count = 0;
        validator_config.min_stake_amount = 1000; // Default minimum stake
        validator_config.reward_per_validation = 10; // Default reward
        validator_config.validation_threshold = 3; // Default threshold
        validator_config.bump = *ctx.bumps.get("validator_config").unwrap();
        
        msg!("Memory validator program initialized");
        Ok(())
    }
    
    pub fn register_validator(ctx: Context<RegisterValidator>, stake_amount: u64) -> Result<()> {
        let validator_config = &mut ctx.accounts.validator_config;
        
        // Check minimum stake amount
        require!(
            stake_amount >= validator_config.min_stake_amount,
            ErrorCode::InsufficientStake
        );
        
        // Update validator count
        validator_config.validator_count = validator_config.validator_count.checked_add(1).unwrap();
        
        // Initialize validator account
        let validator = &mut ctx.accounts.validator;
        validator.authority = ctx.accounts.authority.key();
        validator.stake_amount = stake_amount;
        validator.validations_performed = 0;
        validator.rewards_earned = 0;
        validator.is_active = true;
        validator.last_validation = 0;
        validator.validator_config = validator_config.key();
        validator.bump = *ctx.bumps.get("validator").unwrap();
        
        msg!("Validator registered with stake amount: {}", stake_amount);
        Ok(())
    }
    
    pub fn submit_validation(
        ctx: Context<SubmitValidation>,
        memory_id: Pubkey,
        is_valid: bool,
        quality_score: u8,
        timestamp: i64,
    ) -> Result<()> {
        // Ensure validator is active
        let validator = &mut ctx.accounts.validator;
        require!(validator.is_active, ErrorCode::ValidatorInactive);
        
        // Check quality score range
        require!(quality_score <= 10, ErrorCode::InvalidQualityScore);
        
        // Create validation record
        let validation = &mut ctx.accounts.validation;
        validation.validator = validator.key();
        validation.memory_id = memory_id;
        validation.is_valid = is_valid;
        validation.quality_score = quality_score;
        validation.timestamp = timestamp;
        validation.is_processed = false;
        validation.validator_config = ctx.accounts.validator_config.key();
        validation.bump = *ctx.bumps.get("validation").unwrap();
        
        // Update validator stats
        validator.validations_performed = validator.validations_performed.checked_add(1).unwrap();
        validator.last_validation = timestamp;
        
        msg!("Validation submitted for memory: {}", memory_id);
        Ok(())
    }
    
    pub fn process_validation(ctx: Context<ProcessValidation>) -> Result<()> {
        // Ensure only authority can process
        require!(
            ctx.accounts.authority.key() == ctx.accounts.validator_config.authority,
            ErrorCode::NotAuthorized
        );
        
        // Mark validation as processed
        let validation = &mut ctx.accounts.validation;
        validation.is_processed = true;
        
        // Reward validator
        let validator = &mut ctx.accounts.validator;
        let reward_amount = ctx.accounts.validator_config.reward_per_validation;
        validator.rewards_earned = validator.rewards_earned.checked_add(reward_amount).unwrap();
        
        msg!("Validation processed and rewarded: {} tokens", reward_amount);
        Ok(())
    }
    
    pub fn update_validator_config(
        ctx: Context<UpdateValidatorConfig>,
        min_stake_amount: Option<u64>,
        reward_per_validation: Option<u64>,
        validation_threshold: Option<u8>,
    ) -> Result<()> {
        // Ensure only authority can update
        require!(
            ctx.accounts.authority.key() == ctx.accounts.validator_config.authority,
            ErrorCode::NotAuthorized
        );
        
        let config = &mut ctx.accounts.validator_config;
        
        if let Some(min_stake) = min_stake_amount {
            config.min_stake_amount = min_stake;
        }
        
        if let Some(reward) = reward_per_validation {
            config.reward_per_validation = reward;
        }
        
        if let Some(threshold) = validation_threshold {
            config.validation_threshold = threshold;
        }
        
        msg!("Validator configuration updated");
        Ok(())
    }
    
    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let validator = &mut ctx.accounts.validator;
        
        // Mark validator as inactive
        validator.is_active = false;
        validator.stake_amount = 0;
        
        msg!("Validator unstaked and set to inactive");
        Ok(())
    }
    
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let validator = &mut ctx.accounts.validator;
        let rewards = validator.rewards_earned;
        
        // Reset rewards
        validator.rewards_earned = 0;
        
        msg!("Claimed {} reward tokens", rewards);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + ValidatorConfig::LEN,
        seeds = [b"validator-config"],
        bump
    )]
    pub validator_config: Account<'info, ValidatorConfig>,
    
    pub staking_token_mint: Account<'info, Mint>,
    pub reward_token_mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterValidator<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"validator-config"],
        bump = validator_config.bump
    )]
    pub validator_config: Account<'info, ValidatorConfig>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Validator::LEN,
        seeds = [b"validator", authority.key().as_ref()],
        bump
    )]
    pub validator: Account<'info, Validator>,
    
    #[account(
        mut,
        constraint = staking_token_account.mint == validator_config.staking_token_mint,
        constraint = staking_token_account.owner == authority.key()
    )]
    pub staking_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitValidation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [b"validator-config"],
        bump = validator_config.bump
    )]
    pub validator_config: Account<'info, ValidatorConfig>,
    
    #[account(
        mut,
        seeds = [b"validator", authority.key().as_ref()],
        bump = validator.bump,
        constraint = validator.authority == authority.key()
    )]
    pub validator: Account<'info, Validator>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Validation::LEN,
        seeds = [b"validation", validator.key().as_ref(), &validator.validations_performed.to_le_bytes()],
        bump
    )]
    pub validation: Account<'info, Validation>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessValidation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [b"validator-config"],
        bump = validator_config.bump
    )]
    pub validator_config: Account<'info, ValidatorConfig>,
    
    #[account(
        mut,
        constraint = validator.validator_config == validator_config.key()
    )]
    pub validator: Account<'info, Validator>,
    
    #[account(
        mut,
        constraint = validation.validator == validator.key(),
        constraint = validation.validator_config == validator_config.key(),
        constraint = !validation.is_processed
    )]
    pub validation: Account<'info, Validation>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateValidatorConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"validator-config"],
        bump = validator_config.bump
    )]
    pub validator_config: Account<'info, ValidatorConfig>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [b"validator-config"],
        bump = validator_config.bump
    )]
    pub validator_config: Account<'info, ValidatorConfig>,
    
    #[account(
        mut,
        seeds = [b"validator", authority.key().as_ref()],
        bump = validator.bump,
        constraint = validator.authority == authority.key(),
        constraint = validator.is_active
    )]
    pub validator: Account<'info, Validator>,
    
    #[account(
        mut,
        constraint = staking_token_account.mint == validator_config.staking_token_mint,
        constraint = staking_token_account.owner == authority.key()
    )]
    pub staking_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [b"validator-config"],
        bump = validator_config.bump
    )]
    pub validator_config: Account<'info, ValidatorConfig>,
    
    #[account(
        mut,
        seeds = [b"validator", authority.key().as_ref()],
        bump = validator.bump,
        constraint = validator.authority == authority.key(),
        constraint = validator.rewards_earned > 0
    )]
    pub validator: Account<'info, Validator>,
    
    #[account(
        mut,
        constraint = reward_token_account.mint == validator_config.reward_token_mint,
        constraint = reward_token_account.owner == authority.key()
    )]
    pub reward_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ValidatorConfig {
    pub authority: Pubkey,
    pub staking_token_mint: Pubkey,
    pub reward_token_mint: Pubkey,
    pub validator_count: u64,
    pub min_stake_amount: u64,
    pub reward_per_validation: u64,
    pub validation_threshold: u8,
    pub bump: u8,
}

impl ValidatorConfig {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct Validator {
    pub authority: Pubkey,
    pub stake_amount: u64,
    pub validations_performed: u64,
    pub rewards_earned: u64,
    pub is_active: bool,
    pub last_validation: i64,
    pub validator_config: Pubkey,
    pub bump: u8,
}

impl Validator {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1 + 8 + 32 + 1;
}

#[account]
pub struct Validation {
    pub validator: Pubkey,
    pub memory_id: Pubkey,
    pub is_valid: bool,
    pub quality_score: u8,
    pub timestamp: i64,
    pub is_processed: bool,
    pub validator_config: Pubkey,
    pub bump: u8,
}

impl Validation {
    pub const LEN: usize = 32 + 32 + 1 + 1 + 8 + 1 + 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Not authorized to perform this action")]
    NotAuthorized,
    
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    
    #[msg("Validator is not active")]
    ValidatorInactive,
    
    #[msg("Invalid quality score (must be 0-10)")]
    InvalidQualityScore,
} 