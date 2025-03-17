# NeuraMint Smart Contracts

## Overview

NeuraMint's blockchain functionality is powered by a suite of custom Solana programs (smart contracts) that enable memory NFT operations, validation mechanisms, marketplace transactions, and token economics. This document provides a comprehensive reference for developers working with NeuraMint's on-chain components.

## Program Architecture

NeuraMint implements a modular smart contract architecture with four primary programs:

1. **Memory NFT Program**: Manages the creation, ownership, and attributes of neural memory NFTs
2. **Validator Program**: Handles validator registration, staking, and the memory validation process
3. **Marketplace Program**: Facilitates memory NFT listings, purchases, auctions, and offers
4. **NRAM Token Program**: Implements the NRAM utility token used throughout the platform

These programs interact through cross-program invocations (CPIs) while maintaining separation of concerns for security and maintainability.

## Memory NFT Program

### Program ID
```
neura1np5mxds9hvj38dqwz09xtaw28r7zjnm7mzt4tkv
```

### Account Structures

#### Memory Account
```rust
pub struct Memory {
    pub version: u8,                // Protocol version
    pub mint: Pubkey,               // Memory NFT mint address
    pub owner: Pubkey,              // Current owner
    pub creator: Pubkey,            // Original creator
    pub memory_type: MemoryType,    // Emotional, Cognitive, Cultural, Therapeutic
    pub quality: MemoryQuality,     // Common, Fine, Excellent, Legendary
    pub metadata_uri: String,       // IPFS URI for metadata
    pub validation_score: u8,       // Aggregate validation score (0-100)
    pub is_listed: bool,            // Whether memory is listed on marketplace
    pub created_at: i64,            // Timestamp of creation
    pub neural_fingerprint: [u8; 32], // Unique neural data hash
    pub validations_received: u16,  // Number of validations received
    pub bump: u8,                   // PDA bump seed
}

pub enum MemoryType {
    Emotional,
    Cognitive,
    Cultural,
    Therapeutic,
}

pub enum MemoryQuality {
    Common,
    Fine,
    Excellent,
    Legendary,
}
```

#### Memory Metadata Account (Off-chain)
```json
{
  "name": "Memory Title",
  "description": "Memory description and details",
  "image": "ipfs://CID/preview.jpg",
  "external_url": "https://neuramint.tech/memories/memory-id",
  "attributes": [
    {
      "trait_type": "Memory Type",
      "value": "Emotional"
    },
    {
      "trait_type": "Quality",
      "value": "Excellent"
    },
    {
      "trait_type": "Emotional Valence",
      "value": "Positive",
      "max_value": 10,
      "display_type": "boost_number"
    },
    {
      "trait_type": "Cognitive Load",
      "value": 3,
      "max_value": 10
    },
    {
      "trait_type": "Brain Region",
      "value": "Prefrontal Cortex"
    },
    {
      "trait_type": "Capture Device",
      "value": "EMOTIV EPOC X"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "ipfs://CID/preview.jpg",
        "type": "image/jpeg"
      },
      {
        "uri": "ipfs://CID/memory.json",
        "type": "application/json"
      }
    ],
    "category": "memory",
    "creators": [
      {
        "address": "8JnBvEAHtNXfTGCm1DQzQB2AKd7fuispJJrpB9BiQwNJ",
        "share": 100
      }
    ],
    "neural_fingerprint": "ae729498a13a8064802dc83f3b7d85871d5a4eeb23787888170f762360c2",
    "capture_timestamp": 1645887641,
    "validation_score": 87
  }
}
```

### Instructions

#### Initialize Memory

Creates a new Memory account in preparation for minting.

```rust
pub fn initialize_memory(
    ctx: Context<InitializeMemory>,
    memory_type: MemoryType,
    metadata_uri: String,
    neural_fingerprint: [u8; 32],
) -> Result<()>
```

**Parameters:**
- `memory_type`: Type of neural memory (Emotional, Cognitive, Cultural, Therapeutic)
- `metadata_uri`: IPFS URI pointing to the memory metadata
- `neural_fingerprint`: Unique hash generated from the neural data

**Accounts:**
- `memory`: The memory account to initialize (PDA)
- `mint`: The token mint address
- `owner`: The initial owner/creator of the memory
- `system_program`: System Program
- `token_program`: Token Program
- `rent`: Rent Sysvar

#### Mint Memory

Mints a new memory NFT to the specified owner.

```rust
pub fn mint_memory(
    ctx: Context<MintMemory>,
    quality: MemoryQuality,
) -> Result<()>
```

**Parameters:**
- `quality`: Initial quality rating for the memory

**Accounts:**
- `memory`: Previously initialized memory account
- `mint`: Token mint account
- `token_account`: Owner's token account to receive the NFT
- `owner`: The memory owner
- `payer`: Account paying for the transaction
- `metadata`: Metaplex metadata account
- `token_program`: Token Program
- `metadata_program`: Metaplex Token Metadata Program
- `system_program`: System Program
- `rent`: Rent Sysvar

#### Update Metadata

Updates a memory's metadata URI.

```rust
pub fn update_metadata(
    ctx: Context<UpdateMetadata>,
    new_metadata_uri: String,
) -> Result<()>
```

**Parameters:**
- `new_metadata_uri`: New IPFS URI for the memory metadata

**Accounts:**
- `memory`: Memory account to update
- `owner`: Current owner of the memory (must sign)
- `system_program`: System Program

#### Update Memory Quality

Updates a memory's quality level based on validation results.

```rust
pub fn update_memory_quality(
    ctx: Context<UpdateMemoryQuality>,
    new_quality: MemoryQuality,
    validation_score: u8,
) -> Result<()>
```

**Parameters:**
- `new_quality`: New quality rating for the memory
- `validation_score`: Updated validation score (0-100)

**Accounts:**
- `memory`: Memory account to update
- `validator_program`: Validator program (for cross-program authorization)
- `validator`: Validator account making the update
- `system_program`: System Program

#### Transfer Memory

Transfers a memory NFT to a new owner (internal function, called through SPL token transfer).

```rust
pub fn transfer_memory(
    ctx: Context<TransferMemory>,
) -> Result<()>
```

**Accounts:**
- `memory`: Memory account being transferred
- `mint`: Token mint account
- `from_token_account`: Sender's token account
- `to_token_account`: Recipient's token account
- `from_owner`: Current owner (must sign)
- `to_owner`: New owner
- `token_program`: Token Program

#### Burn Memory

Permanently destroys a memory NFT.

```rust
pub fn burn_memory(
    ctx: Context<BurnMemory>,
) -> Result<()>
```

**Accounts:**
- `memory`: Memory account to burn
- `mint`: Token mint account
- `token_account`: Owner's token account
- `owner`: Memory owner (must sign)
- `token_program`: Token Program
- `metadata`: Metaplex metadata account
- `metadata_program`: Metaplex Token Metadata Program

### Events

#### MemoryInitialized

```rust
pub struct MemoryInitialized {
    pub memory: Pubkey,
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub memory_type: MemoryType,
    pub metadata_uri: String,
    pub timestamp: i64,
}
```

#### MemoryMinted

```rust
pub struct MemoryMinted {
    pub memory: Pubkey,
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub quality: MemoryQuality,
    pub timestamp: i64,
}
```

#### MemoryQualityUpdated

```rust
pub struct MemoryQualityUpdated {
    pub memory: Pubkey,
    pub previous_quality: MemoryQuality,
    pub new_quality: MemoryQuality,
    pub validation_score: u8,
    pub timestamp: i64,
}
```

## Validator Program

### Program ID
```
neura2vp5jtz7n645x3ja8d9z07p6eqcv3frm82vn5kt
```

### Account Structures

#### Validator Account
```rust
pub struct Validator {
    pub version: u8,                // Protocol version
    pub owner: Pubkey,              // Validator wallet address
    pub stake_account: Pubkey,      // Address holding staked NRAM tokens
    pub reputation_score: u8,       // Validator reputation (0-100)
    pub validations_completed: u64, // Total validations performed
    pub pending_rewards: u64,       // Unclaimed rewards in NRAM lamports
    pub status: ValidatorStatus,    // Active, Probation, Suspended
    pub tier: ValidatorTier,        // Based on stake size and reputation
    pub last_active: i64,           // Timestamp of last validation
    pub validated_memories: u64,    // Count of unique memories validated
    pub bump: u8,                   // PDA bump seed
}

pub enum ValidatorStatus {
    Active,
    Probation,
    Suspended,
}

pub enum ValidatorTier {
    Bronze,    // Minimum stake
    Silver,    // 2x minimum stake
    Gold,      // 5x minimum stake
    Platinum,  // 10x minimum stake
}
```

#### Validation Account
```rust
pub struct Validation {
    pub version: u8,                // Protocol version
    pub memory: Pubkey,             // Memory being validated
    pub validator: Pubkey,          // Validator performing validation
    pub score: u8,                  // Validation score (0-100)
    pub timestamp: i64,             // When validation was submitted
    pub reward_claimed: bool,       // Whether reward has been claimed
    pub reward_amount: u64,         // Rewards earned for this validation
    pub bump: u8,                   // PDA bump seed
}
```

#### Validation Criteria
```rust
pub struct ValidationCriteria {
    pub authenticity_weight: u8,    // Weight for authenticity score
    pub clarity_weight: u8,         // Weight for clarity score
    pub coherence_weight: u8,       // Weight for coherence score
    pub emotional_weight: u8,       // Weight for emotional impact score
    pub minimum_validators: u8,     // Minimum validators required
    pub reward_per_validation: u64, // Base NRAM reward per validation
    pub quality_thresholds: [u8; 3], // Score thresholds for quality tiers
}
```

### Instructions

#### Register Validator

Registers a new validator and processes the initial stake.

```rust
pub fn register_validator(
    ctx: Context<RegisterValidator>,
    stake_amount: u64,
) -> Result<()>
```

**Parameters:**
- `stake_amount`: Amount of NRAM tokens to stake (must meet minimum requirement)

**Accounts:**
- `validator`: New validator account (PDA)
- `owner`: Validator owner wallet
- `stake_account`: Account to hold staked tokens
- `token_source`: Owner's NRAM token account
- `nram_mint`: NRAM token mint
- `token_program`: Token Program
- `system_program`: System Program
- `rent`: Rent Sysvar

#### Stake Tokens

Adds NRAM tokens to validator stake.

```rust
pub fn stake_tokens(
    ctx: Context<StakeTokens>,
    amount: u64,
) -> Result<()>
```

**Parameters:**
- `amount`: Additional NRAM tokens to stake

**Accounts:**
- `validator`: Validator account
- `owner`: Validator owner wallet
- `stake_account`: Account holding staked tokens
- `token_source`: Owner's NRAM token account
- `nram_mint`: NRAM token mint
- `token_program`: Token Program

#### Unstake Tokens

Removes NRAM tokens from validator stake (with time lock).

```rust
pub fn unstake_tokens(
    ctx: Context<UnstakeTokens>,
    amount: u64,
) -> Result<()>
```

**Parameters:**
- `amount`: Amount of NRAM tokens to unstake

**Accounts:**
- `validator`: Validator account
- `owner`: Validator owner wallet
- `stake_account`: Account holding staked tokens
- `token_destination`: Owner's NRAM token account
- `nram_mint`: NRAM token mint
- `token_program`: Token Program
- `unstake_timelock`: Timelock account for unstaking process

#### Submit Validation

Submits a validation result for a memory.

```rust
pub fn submit_validation(
    ctx: Context<SubmitValidation>,
    authenticity_score: u8,
    clarity_score: u8,
    coherence_score: u8,
    emotional_score: u8,
) -> Result<()>
```

**Parameters:**
- `authenticity_score`: Rating for memory authenticity (0-100)
- `clarity_score`: Rating for memory clarity (0-100)
- `coherence_score`: Rating for memory coherence (0-100)
- `emotional_score`: Rating for emotional impact (0-100)

**Accounts:**
- `validation`: New validation account
- `validator`: Validator account
- `memory`: Memory being validated
- `memory_program`: Memory NFT program
- `owner`: Validator owner wallet
- `system_program`: System Program
- `validation_criteria`: Current validation criteria account

#### Claim Rewards

Claims earned validation rewards.

```rust
pub fn claim_rewards(
    ctx: Context<ClaimRewards>,
) -> Result<()>
```

**Accounts:**
- `validator`: Validator account
- `owner`: Validator owner wallet
- `reward_destination`: Owner's NRAM token account to receive rewards
- `reward_source`: Program reward vault
- `nram_mint`: NRAM token mint
- `token_program`: Token Program

#### Update Validator Status

Updates validator status (admin only).

```rust
pub fn update_validator_status(
    ctx: Context<UpdateValidatorStatus>,
    new_status: ValidatorStatus,
) -> Result<()>
```

**Parameters:**
- `new_status`: New validator status

**Accounts:**
- `validator`: Validator account to update
- `admin`: Program admin (must sign)
- `system_program`: System Program

### Events

#### ValidatorRegistered

```rust
pub struct ValidatorRegistered {
    pub validator: Pubkey,
    pub owner: Pubkey,
    pub stake_amount: u64,
    pub timestamp: i64,
}
```

#### ValidationSubmitted

```rust
pub struct ValidationSubmitted {
    pub validation: Pubkey,
    pub validator: Pubkey,
    pub memory: Pubkey,
    pub score: u8,
    pub timestamp: i64,
}
```

#### RewardsClaimed

```rust
pub struct RewardsClaimed {
    pub validator: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
```

## Marketplace Program

### Program ID
```
neura3mpmx452tse7z2sz9a8ujkr67yj3ntx95mphct
```

### Account Structures

#### Listing Account
```rust
pub struct Listing {
    pub version: u8,                // Protocol version
    pub memory_mint: Pubkey,        // Memory NFT mint address
    pub seller: Pubkey,             // Seller wallet address
    pub price: u64,                 // Price in lamports
    pub currency: Currency,         // SOL or NRAM
    pub listed_at: i64,             // Timestamp when listed
    pub expiry: Option<i64>,        // Optional expiration timestamp
    pub status: ListingStatus,      // Active, Sold, Cancelled
    pub escrow_token_account: Pubkey, // Escrow holding the listed NFT
    pub bump: u8,                   // PDA bump seed
}

pub enum Currency {
    SOL,
    NRAM,
}

pub enum ListingStatus {
    Active,
    Sold,
    Cancelled,
}
```

#### Auction Account
```rust
pub struct Auction {
    pub version: u8,                // Protocol version
    pub memory_mint: Pubkey,        // Memory NFT mint address
    pub seller: Pubkey,             // Seller wallet address
    pub start_price: u64,           // Starting price in lamports
    pub current_price: u64,         // Current highest bid
    pub current_bidder: Option<Pubkey>, // Current highest bidder
    pub currency: Currency,         // SOL or NRAM
    pub start_time: i64,            // Auction start timestamp
    pub end_time: i64,              // Auction end timestamp
    pub status: AuctionStatus,      // Active, Ended, Cancelled
    pub escrow_token_account: Pubkey, // Escrow holding the auctioned NFT
    pub min_bid_increment: u64,     // Minimum bid increment
    pub extension_period: i64,      // Time extension on late bids
    pub bump: u8,                   // PDA bump seed
}

pub enum AuctionStatus {
    Active,
    Ended,
    Cancelled,
}
```

#### Offer Account
```rust
pub struct Offer {
    pub version: u8,                // Protocol version
    pub memory_mint: Pubkey,        // Memory NFT mint address
    pub buyer: Pubkey,              // Buyer making the offer
    pub price: u64,                 // Offer price in lamports
    pub currency: Currency,         // SOL or NRAM
    pub created_at: i64,            // Offer creation timestamp
    pub expiry: i64,                // Offer expiration timestamp
    pub status: OfferStatus,        // Active, Accepted, Declined, Expired
    pub escrow_account: Pubkey,     // Escrow holding the offer funds
    pub bump: u8,                   // PDA bump seed
}

pub enum OfferStatus {
    Active,
    Accepted,
    Declined,
    Expired,
}
```

### Instructions

#### Create Listing

Lists a memory NFT for sale.

```rust
pub fn create_listing(
    ctx: Context<CreateListing>,
    price: u64,
    currency: Currency,
    expiry: Option<i64>,
) -> Result<()>
```

**Parameters:**
- `price`: Price for the memory NFT
- `currency`: Currency for the transaction (SOL or NRAM)
- `expiry`: Optional expiration timestamp

**Accounts:**
- `listing`: New listing account
- `memory_mint`: Memory NFT mint
- `seller`: Seller wallet address
- `seller_token_account`: Seller's NFT token account
- `escrow_token_account`: Escrow to hold the NFT during listing
- `memory_program`: Memory NFT program
- `token_program`: Token Program
- `system_program`: System Program
- `rent`: Rent Sysvar

#### Cancel Listing

Removes a memory NFT from marketplace.

```rust
pub fn cancel_listing(
    ctx: Context<CancelListing>,
) -> Result<()>
```

**Accounts:**
- `listing`: Listing account to cancel
- `memory_mint`: Memory NFT mint
- `seller`: Seller wallet address
- `seller_token_account`: Seller's NFT token account
- `escrow_token_account`: Escrow holding the NFT
- `token_program`: Token Program

#### Purchase Memory

Processes a memory NFT purchase.

```rust
pub fn purchase_memory(
    ctx: Context<PurchaseMemory>,
) -> Result<()>
```

**Accounts:**
- `listing`: Active listing account
- `memory_mint`: Memory NFT mint
- `seller`: Seller wallet address
- `buyer`: Buyer wallet address
- `seller_token_account`: Seller's payment token account
- `buyer_token_account`: Buyer's NFT token account
- `escrow_token_account`: Escrow holding the NFT
- `payment_account`: Account for payment (SOL or NRAM)
- `memory_program`: Memory NFT program
- `token_program`: Token Program
- `system_program`: System Program
- `platform_fee_account`: Platform fee collection account

#### Create Auction

Creates a timed auction for a memory NFT.

```rust
pub fn create_auction(
    ctx: Context<CreateAuction>,
    start_price: u64,
    currency: Currency,
    duration: i64,
    min_bid_increment: u64,
    extension_period: i64,
) -> Result<()>
```

**Parameters:**
- `start_price`: Starting price for the auction
- `currency`: Currency for bids (SOL or NRAM)
- `duration`: Auction duration in seconds
- `min_bid_increment`: Minimum increment for new bids
- `extension_period`: Time extension for late bids

**Accounts:**
- `auction`: New auction account
- `memory_mint`: Memory NFT mint
- `seller`: Seller wallet address
- `seller_token_account`: Seller's NFT token account
- `escrow_token_account`: Escrow to hold the NFT during auction
- `memory_program`: Memory NFT program
- `token_program`: Token Program
- `system_program`: System Program
- `clock`: Clock sysvar
- `rent`: Rent Sysvar

#### Place Bid

Places a bid on an auction.

```rust
pub fn place_bid(
    ctx: Context<PlaceBid>,
    bid_amount: u64,
) -> Result<()>
```

**Parameters:**
- `bid_amount`: Bid amount in currency lamports

**Accounts:**
- `auction`: Active auction account
- `bidder`: Bidder wallet address
- `previous_bidder`: Previous highest bidder (if applicable)
- `previous_bid_escrow`: Escrow holding previous bid
- `bid_escrow`: Escrow for current bid
- `payment_source`: Bidder's payment account
- `token_program`: Token Program (if NRAM)
- `system_program`: System Program
- `clock`: Clock sysvar

#### Settle Auction

Finalizes an auction after end time.

```rust
pub fn settle_auction(
    ctx: Context<SettleAuction>,
) -> Result<()>
```

**Accounts:**
- `auction`: Completed auction account
- `memory_mint`: Memory NFT mint
- `seller`: Seller wallet address
- `winning_bidder`: Auction winner
- `seller_payment_account`: Seller's payment account
- `winner_token_account`: Winner's NFT token account
- `escrow_token_account`: Escrow holding the NFT
- `winning_bid_escrow`: Escrow holding winning bid
- `memory_program`: Memory NFT program
- `token_program`: Token Program (if NRAM)
- `system_program`: System Program
- `platform_fee_account`: Platform fee collection account
- `clock`: Clock sysvar

#### Make Offer

Makes an offer on a non-listed memory NFT.

```rust
pub fn make_offer(
    ctx: Context<MakeOffer>,
    price: u64,
    currency: Currency,
    expiry: i64,
) -> Result<()>
```

**Parameters:**
- `price`: Offer price
- `currency`: Currency for the offer (SOL or NRAM)
- `expiry`: Expiration timestamp for the offer

**Accounts:**
- `offer`: New offer account
- `memory_mint`: Memory NFT mint
- `memory_owner`: Current memory owner
- `buyer`: Buyer making the offer
- `escrow_account`: Escrow to hold offer funds
- `payment_source`: Buyer's payment account
- `token_program`: Token Program (if NRAM)
- `system_program`: System Program
- `clock`: Clock sysvar
- `rent`: Rent Sysvar

### Events

#### ListingCreated

```rust
pub struct ListingCreated {
    pub listing: Pubkey,
    pub memory_mint: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
    pub currency: Currency,
    pub timestamp: i64,
}
```

#### ListingSold

```rust
pub struct ListingSold {
    pub listing: Pubkey,
    pub memory_mint: Pubkey,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
    pub timestamp: i64,
}
```

#### AuctionCreated

```rust
pub struct AuctionCreated {
    pub auction: Pubkey,
    pub memory_mint: Pubkey,
    pub seller: Pubkey,
    pub start_price: u64,
    pub end_time: i64,
    pub timestamp: i64,
}
```

#### AuctionBid

```rust
pub struct AuctionBid {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub bid_amount: u64,
    pub timestamp: i64,
}
```

## NRAM Token Program

The NRAM token is implemented using the Solana SPL Token standard.

### Token Details

- **Program ID**: `neuratk1nmpxfvaqm6sk4nvr8wpj9qkdk5t4fsjnmv5`
- **Token Mint**: `NRAMmEYgBHrYbqQGJET8FXUvHh1W4uTv9W99aM9r4Vd`
- **Decimals**: 9 (1 NRAM = 10^9 lamports)
- **Total Supply**: 1,000,000,000 NRAM

### Token Distribution

- **Platform Rewards and Ecosystem**: 40% (400,000,000 NRAM)
- **Team and Advisors**: 25% (250,000,000 NRAM)
- **Public Sale**: 20% (200,000,000 NRAM)
- **Private Investors**: 10% (100,000,000 NRAM)
- **Community Initiatives and Grants**: 5% (50,000,000 NRAM)

### Token Utility

1. **Validation Staking**: Stake NRAM to participate as a validator
2. **Validation Rewards**: Earn NRAM for accurate memory validations
3. **Marketplace Fees**: Pay reduced fees when using NRAM
4. **Governance Rights**: Vote on platform development decisions
5. **Memory Enhancement**: Access premium memory enhancement features
6. **Creator Rewards**: Earn NRAM for creating high-quality memories

## Cross-Program Interactions

NeuraMint programs interact in several key ways:

1. **Memory NFT ↔ Validator Program**:
   - Validator program updates memory quality based on validation results
   - Memory program verifies validator authorization for quality updates

2. **Memory NFT ↔ Marketplace Program**:
   - Marketplace program transfers memory ownership during sales
   - Memory program updates ownership records based on marketplace transactions

3. **Validator Program ↔ NRAM Token Program**:
   - Validator program manages token staking and rewards distribution
   - NRAM token program processes token transfers for staking operations

4. **Marketplace Program ↔ NRAM Token Program**:
   - Marketplace program processes NRAM payments for NFT purchases
   - NRAM token program transfers tokens between buyers and sellers

## Security Considerations

### Access Control

All NeuraMint programs implement strict access control:

- **Owner-Only Operations**: Only memory owners can update metadata or authorize listings
- **Validator Authorization**: Only registered validators can submit validation results
- **Admin Functions**: Administrative functions are protected by multi-signature authority

### Economic Security

- **Stake Requirements**: Validators must stake NRAM tokens to discourage malicious behavior
- **Slashing Conditions**: Validators can lose staked tokens for consistently inaccurate validations
- **Fee Distribution**: Platform fees support ongoing development and security audits

## Client Integration

### JavaScript/TypeScript SDK

```typescript
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { NeuraMintSDK } from '@neuramint/sdk';

// Initialize the SDK
const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = useWallet(); // From @solana/wallet-adapter-react
const neuraMint = new NeuraMintSDK({ connection, wallet });

// Memory NFT operations
const mintMemory = async (metadataUri, neuralFingerprint, memoryType) => {
  const { signature, memoryAddress } = await neuraMint.memory.mintMemory({
    metadataUri,
    neuralFingerprint,
    memoryType,
  });
  
  console.log(`Memory minted: ${memoryAddress.toString()}`);
  return { signature, memoryAddress };
};

// Validator operations
const registerValidator = async (stakeAmount) => {
  const { signature, validatorAddress } = await neuraMint.validator.registerValidator({
    stakeAmount,
  });
  
  console.log(`Validator registered: ${validatorAddress.toString()}`);
  return { signature, validatorAddress };
};

// Marketplace operations
const listMemory = async (memoryMint, price, currency) => {
  const { signature, listingAddress } = await neuraMint.marketplace.createListing({
    memoryMint,
    price,
    currency,
  });
  
  console.log(`Memory listed: ${listingAddress.toString()}`);
  return { signature, listingAddress };
};
```

## Development and Testing

### Local Development Environment

To set up a local development environment for working with NeuraMint smart contracts:

1. Install dependencies:
   ```bash
   npm install @solana/web3.js @solana/spl-token @project-serum/anchor
   ```

2. Configure local validator:
   ```bash
   solana-test-validator
   ```

3. Deploy programs to local validator:
   ```bash
   anchor deploy --provider.cluster localnet
   ```

4. Run tests:
   ```bash
   anchor test --provider.cluster localnet
   ```

### Testnet Deployment

For testing on Solana Testnet:

1. Configure Solana CLI:
   ```bash
   solana config set --url https://api.testnet.solana.com
   ```

2. Airdrop SOL (if needed):
   ```bash
   solana airdrop 5
   ```

3. Deploy programs:
   ```bash
   anchor deploy --provider.cluster testnet
   ```

## Conclusion

NeuraMint's smart contracts provide a robust foundation for the neural memory ecosystem on Solana. These programs enable secure and efficient creation, validation, and trading of memory NFTs while leveraging Solana's high performance and low transaction costs.

For more information on integrating with NeuraMint smart contracts, refer to the following resources:

- [API Documentation](../api/API.md)
- [Blockchain Integration Overview](./INTEGRATION.md)
- [SDK Reference](../development/SDK.md) 