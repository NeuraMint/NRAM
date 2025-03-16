use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod nram_token {
    use super::*;
    
    pub fn initialize(
        ctx: Context<Initialize>,
        total_supply: u64,
    ) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        token_config.authority = ctx.accounts.authority.key();
        token_config.mint = ctx.accounts.mint.key();
        token_config.total_supply = total_supply;
        token_config.circulating_supply = 0;
        token_config.staking_enabled = false;
        token_config.governance_enabled = false;
        token_config.bump = *ctx.bumps.get("token_config").unwrap();
        
        msg!("NRAM token initialized with total supply: {}", total_supply);
        Ok(())
    }
    
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        // Ensure only authority can mint
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_config.authority,
            ErrorCode::NotAuthorized
        );
        
        // Check if minting would exceed total supply
        let token_config = &mut ctx.accounts.token_config;
        let new_circulating = token_config.circulating_supply.checked_add(amount)
            .ok_or(ErrorCode::SupplyOverflow)?;
            
        require!(
            new_circulating <= token_config.total_supply,
            ErrorCode::ExceedsTotalSupply
        );
        
        // Update circulating supply
        token_config.circulating_supply = new_circulating;
        
        msg!("Minted {} NRAM tokens", amount);
        Ok(())
    }
    
    pub fn burn_tokens(
        ctx: Context<BurnTokens>,
        amount: u64,
    ) -> Result<()> {
        // Update circulating supply
        let token_config = &mut ctx.accounts.token_config;
        token_config.circulating_supply = token_config.circulating_supply
            .checked_sub(amount)
            .ok_or(ErrorCode::SupplyUnderflow)?;
            
        msg!("Burned {} NRAM tokens", amount);
        Ok(())
    }
    
    pub fn enable_staking(ctx: Context<UpdateConfig>, enabled: bool) -> Result<()> {
        // Ensure only authority can update config
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_config.authority,
            ErrorCode::NotAuthorized
        );
        
        let token_config = &mut ctx.accounts.token_config;
        token_config.staking_enabled = enabled;
        
        msg!("Staking {}abled for NRAM token", if enabled { "en" } else { "dis" });
        Ok(())
    }
    
    pub fn enable_governance(ctx: Context<UpdateConfig>, enabled: bool) -> Result<()> {
        // Ensure only authority can update config
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_config.authority,
            ErrorCode::NotAuthorized
        );
        
        let token_config = &mut ctx.accounts.token_config;
        token_config.governance_enabled = enabled;
        
        msg!("Governance {}abled for NRAM token", if enabled { "en" } else { "dis" });
        Ok(())
    }
    
    pub fn transfer_authority(ctx: Context<TransferAuthority>) -> Result<()> {
        // Ensure only current authority can transfer
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_config.authority,
            ErrorCode::NotAuthorized
        );
        
        let token_config = &mut ctx.accounts.token_config;
        token_config.authority = ctx.accounts.new_authority.key();
        
        msg!("Authority transferred to: {}", token_config.authority);
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
        space = 8 + TokenConfig::LEN,
        seeds = [b"token-config", mint.key().as_ref()],
        bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    pub mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"token-config", mint.key().as_ref()],
        bump = token_config.bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    pub mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"token-config", mint.key().as_ref()],
        bump = token_config.bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = token_account.owner == authority.key()
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"token-config", mint.key().as_ref()],
        bump = token_config.bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    pub mint: Account<'info, Mint>,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This will be the new authority
    pub new_authority: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [b"token-config", mint.key().as_ref()],
        bump = token_config.bump
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    pub mint: Account<'info, Mint>,
}

#[account]
pub struct TokenConfig {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_supply: u64,
    pub circulating_supply: u64,
    pub staking_enabled: bool,
    pub governance_enabled: bool,
    pub bump: u8,
}

impl TokenConfig {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 1 + 1 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Not authorized to perform this action")]
    NotAuthorized,
    
    #[msg("Arithmetic overflow when calculating new supply")]
    SupplyOverflow,
    
    #[msg("Arithmetic underflow when calculating new supply")]
    SupplyUnderflow,
    
    #[msg("Mint would exceed total supply")]
    ExceedsTotalSupply,
} 