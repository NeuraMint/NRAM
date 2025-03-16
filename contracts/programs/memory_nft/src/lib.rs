use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use mpl_token_metadata::state::{Collection, Creator, DataV2, Metadata};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod memory_nft {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let memory_data = &mut ctx.accounts.memory_data;
        memory_data.authority = ctx.accounts.authority.key();
        memory_data.memory_count = 0;
        memory_data.bump = *ctx.bumps.get("memory_data").unwrap();
        
        msg!("MemoryNFT program initialized");
        Ok(())
    }

    pub fn mint_memory(
        ctx: Context<MintMemory>,
        uri: String,
        name: String,
        symbol: String,
        memory_type: String,
        memory_quality: u8,
        neural_fingerprint: String,
        timestamp: i64,
    ) -> Result<()> {
        // Validate inputs
        require!(!uri.is_empty(), ErrorCode::EmptyUri);
        require!(!name.is_empty(), ErrorCode::EmptyName);
        require!(!symbol.is_empty(), ErrorCode::EmptySymbol);
        require!(memory_quality > 0 && memory_quality <= 4, ErrorCode::InvalidQuality);
        require!(!neural_fingerprint.is_empty(), ErrorCode::EmptyFingerprint);
        
        // Update memory count
        let memory_data = &mut ctx.accounts.memory_data;
        memory_data.memory_count = memory_data.memory_count.checked_add(1).unwrap();
        
        // Record memory creation
        let memory = &mut ctx.accounts.memory;
        memory.owner = ctx.accounts.authority.key();
        memory.mint = ctx.accounts.mint.key();
        memory.memory_type = memory_type;
        memory.quality = memory_quality;
        memory.neural_fingerprint = neural_fingerprint;
        memory.created_at = timestamp;
        memory.is_transferable = true;
        memory.memory_data = memory_data.key();
        memory.bump = *ctx.bumps.get("memory").unwrap();
        
        msg!("Memory NFT minted: {}", name);
        Ok(())
    }

    pub fn transfer_memory(ctx: Context<TransferMemory>) -> Result<()> {
        let memory = &mut ctx.accounts.memory;
        
        // Ensure memory is transferable
        require!(memory.is_transferable, ErrorCode::NonTransferable);
        
        // Update memory owner
        memory.owner = ctx.accounts.new_owner.key();
        
        msg!("Memory NFT transferred to: {}", memory.owner);
        Ok(())
    }

    pub fn toggle_transferable(ctx: Context<ToggleTransferable>, is_transferable: bool) -> Result<()> {
        let memory = &mut ctx.accounts.memory;
        memory.is_transferable = is_transferable;
        
        msg!("Memory transferability set to: {}", is_transferable);
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
        space = 8 + MemoryData::LEN,
        seeds = [b"memory-data"],
        bump
    )]
    pub memory_data: Account<'info, MemoryData>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintMemory<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"memory-data"],
        bump = memory_data.bump
    )]
    pub memory_data: Account<'info, MemoryData>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Memory::LEN,
        seeds = [b"memory", mint.key().as_ref()],
        bump
    )]
    pub memory: Account<'info, Memory>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = authority,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferMemory<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the new owner of the memory NFT
    pub new_owner: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [b"memory", mint.key().as_ref()],
        bump = memory.bump,
        constraint = memory.owner == authority.key() @ ErrorCode::NotMemoryOwner
    )]
    pub memory: Account<'info, Memory>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub from_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = new_owner,
    )]
    pub to_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ToggleTransferable<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"memory", mint.key().as_ref()],
        bump = memory.bump,
        constraint = memory.owner == authority.key() @ ErrorCode::NotMemoryOwner
    )]
    pub memory: Account<'info, Memory>,
    
    pub mint: Account<'info, Mint>,
}

#[account]
pub struct MemoryData {
    pub authority: Pubkey,
    pub memory_count: u64,
    pub bump: u8,
}

impl MemoryData {
    pub const LEN: usize = 32 + 8 + 1;
}

#[account]
pub struct Memory {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub memory_type: String,
    pub quality: u8,
    pub neural_fingerprint: String,
    pub created_at: i64,
    pub is_transferable: bool,
    pub memory_data: Pubkey,
    pub bump: u8,
}

impl Memory {
    pub const LEN: usize = 32 + 32 + 64 + 1 + 128 + 8 + 1 + 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("URI cannot be empty")]
    EmptyUri,
    
    #[msg("Name cannot be empty")]
    EmptyName,
    
    #[msg("Symbol cannot be empty")]
    EmptySymbol,
    
    #[msg("Invalid memory quality (must be 1-4)")]
    InvalidQuality,
    
    #[msg("Neural fingerprint cannot be empty")]
    EmptyFingerprint,
    
    #[msg("Not the owner of this memory NFT")]
    NotMemoryOwner,
    
    #[msg("This memory NFT is not transferable")]
    NonTransferable,
} 