use anchor_lang::prelude::*;

declare_id!("G45nBxWsUgxZsu9YTEt9QqHEsxtdc495xqnTR5SRwUAC");

#[program]
pub mod solforge {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, fee_bps: u16) -> Result<()> {
        require!(fee_bps <= 10000, ErrorCode::InvalidFeeBps);
        
        let protocol_state = &mut ctx.accounts.protocol_state;
        protocol_state.admin = ctx.accounts.admin.key();
        protocol_state.fee_bps = fee_bps;
        protocol_state.build_count = 0;
        protocol_state.total_builds_completed = 0;
        protocol_state.total_sol_earned = 0;
        protocol_state.bump = ctx.bumps.protocol_state;
        
        Ok(())
    }

    pub fn request_build(ctx: Context<RequestBuild>, spec: String, budget: u64) -> Result<()> {
        require!(spec.len() <= 500, ErrorCode::SpecTooLong);
        require!(budget > 0, ErrorCode::InsufficientBudget);
        
        let protocol_state = &mut ctx.accounts.protocol_state;
        let build_request = &mut ctx.accounts.build_request;
        
        // Transfer budget to escrow
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.requester.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, budget)?;
        
        // Initialize build request
        build_request.id = protocol_state.build_count;
        build_request.requester = ctx.accounts.requester.key();
        build_request.builder = None;
        build_request.spec = spec.clone();
        build_request.budget = budget;
        build_request.status = BuildStatus::Pending;
        build_request.created_at = Clock::get()?.unix_timestamp;
        build_request.completed_at = 0;
        build_request.deployed_program_id = None;
        build_request.step_count = 0;
        build_request.bump = ctx.bumps.build_request;
        
        protocol_state.build_count += 1;
        
        emit!(BuildRequested {
            build_id: build_request.id,
            requester: ctx.accounts.requester.key(),
            spec,
            budget,
            timestamp: build_request.created_at,
        });
        
        Ok(())
    }

    pub fn claim_build(ctx: Context<ClaimBuild>) -> Result<()> {
        let build_request = &mut ctx.accounts.build_request;
        
        require!(
            build_request.status == BuildStatus::Pending,
            ErrorCode::BuildNotPending
        );
        
        require!(
            ctx.accounts.builder_profile.active,
            ErrorCode::InvalidBuilder
        );
        
        build_request.builder = Some(ctx.accounts.builder.key());
        build_request.status = BuildStatus::InProgress;
        
        emit!(BuildClaimed {
            build_id: build_request.id,
            builder: ctx.accounts.builder.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    pub fn log_build_step(
        ctx: Context<LogBuildStep>,
        step_type: StepType,
        description: String,
        content_hash: [u8; 32],
    ) -> Result<()> {
        require!(description.len() <= 200, ErrorCode::DescriptionTooLong);
        
        let build_request = &mut ctx.accounts.build_request;
        
        require!(
            build_request.status == BuildStatus::InProgress,
            ErrorCode::BuildNotInProgress
        );
        
        require!(
            build_request.builder == Some(ctx.accounts.builder.key()),
            ErrorCode::Unauthorized
        );
        
        let build_step = &mut ctx.accounts.build_step;
        build_step.build_id = build_request.id;
        build_step.step_number = build_request.step_count;
        build_step.step_type = step_type;
        build_step.description = description.clone();
        build_step.content_hash = content_hash;
        build_step.timestamp = Clock::get()?.unix_timestamp;
        
        build_request.step_count += 1;
        
        emit!(StepLogged {
            build_id: build_request.id,
            step_number: build_step.step_number,
            step_type,
            description,
            content_hash,
            timestamp: build_step.timestamp,
        });
        
        Ok(())
    }

    pub fn complete_build(
        ctx: Context<CompleteBuild>,
        program_id: Option<String>,
        success: bool,
    ) -> Result<()> {
        if let Some(ref pid) = program_id {
            require!(pid.len() <= 50, ErrorCode::ProgramIdTooLong);
        }
        
        let build_request = &mut ctx.accounts.build_request;
        
        require!(
            build_request.status == BuildStatus::InProgress,
            ErrorCode::BuildNotInProgress
        );
        
        require!(
            build_request.builder == Some(ctx.accounts.builder.key()),
            ErrorCode::Unauthorized
        );
        
        let protocol_state = &mut ctx.accounts.protocol_state;
        let builder_profile = &mut ctx.accounts.builder_profile;
        
        build_request.completed_at = Clock::get()?.unix_timestamp;
        build_request.deployed_program_id = program_id.clone();
        
        let escrow_lamports = ctx.accounts.escrow.lamports();
        
        if success {
            build_request.status = BuildStatus::Completed;
            
            // Calculate protocol fee
            let fee_amount = (escrow_lamports as u128)
                .checked_mul(protocol_state.fee_bps as u128)
                .unwrap()
                .checked_div(10000)
                .unwrap() as u64;
            
            let builder_amount = escrow_lamports.checked_sub(fee_amount).unwrap();
            
            // Transfer to builder using PDA seeds
            let escrow_seeds = &[
                b"escrow",
                build_request.to_account_info().key.as_ref(),
                &[ctx.bumps.escrow],
            ];
            let escrow_signer = &[&escrow_seeds[..]];
            
            // Transfer builder payment
            let transfer_to_builder = anchor_lang::system_program::Transfer {
                from: ctx.accounts.escrow.to_account_info(),
                to: ctx.accounts.builder.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                transfer_to_builder,
                escrow_signer,
            );
            anchor_lang::system_program::transfer(cpi_ctx, builder_amount)?;
            
            // Transfer protocol fee to admin
            let transfer_to_admin = anchor_lang::system_program::Transfer {
                from: ctx.accounts.escrow.to_account_info(),
                to: ctx.accounts.admin.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                transfer_to_admin,
                escrow_signer,
            );
            anchor_lang::system_program::transfer(cpi_ctx, fee_amount)?;
            
            // Update stats
            protocol_state.total_builds_completed += 1;
            protocol_state.total_sol_earned += fee_amount;
            builder_profile.builds_completed += 1;
            builder_profile.total_earned += builder_amount;
        } else {
            build_request.status = BuildStatus::Failed;
            
            // Refund to requester
            let escrow_seeds = &[
                b"escrow",
                build_request.to_account_info().key.as_ref(),
                &[ctx.bumps.escrow],
            ];
            let escrow_signer = &[&escrow_seeds[..]];
            
            let refund_transfer = anchor_lang::system_program::Transfer {
                from: ctx.accounts.escrow.to_account_info(),
                to: ctx.accounts.requester.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                refund_transfer,
                escrow_signer,
            );
            anchor_lang::system_program::transfer(cpi_ctx, escrow_lamports)?;
            
            builder_profile.builds_failed += 1;
        }
        
        emit!(BuildCompleted {
            build_id: build_request.id,
            success,
            program_id,
            timestamp: build_request.completed_at,
        });
        
        Ok(())
    }

    pub fn register_builder(ctx: Context<RegisterBuilder>) -> Result<()> {
        let builder_profile = &mut ctx.accounts.builder_profile;
        
        builder_profile.authority = ctx.accounts.builder_authority.key();
        builder_profile.builds_completed = 0;
        builder_profile.builds_failed = 0;
        builder_profile.total_earned = 0;
        builder_profile.registered_at = Clock::get()?.unix_timestamp;
        builder_profile.active = true;
        builder_profile.bump = ctx.bumps.builder_profile;
        
        Ok(())
    }
}

// ===== CONTEXTS =====

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + ProtocolState::INIT_SPACE,
        seeds = [b"protocol"],
        bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestBuild<'info> {
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    #[account(
        init,
        payer = requester,
        space = 8 + BuildRequest::INIT_SPACE,
        seeds = [b"build", requester.key().as_ref(), protocol_state.build_count.to_le_bytes().as_ref()],
        bump
    )]
    pub build_request: Account<'info, BuildRequest>,
    
    #[account(
        mut,
        seeds = [b"escrow", build_request.key().as_ref()],
        bump
    )]
    /// CHECK: Escrow PDA for holding funds
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub requester: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimBuild<'info> {
    #[account(
        mut,
        constraint = build_request.status == BuildStatus::Pending @ ErrorCode::BuildNotPending
    )]
    pub build_request: Account<'info, BuildRequest>,
    
    #[account(
        seeds = [b"builder", builder.key().as_ref()],
        bump = builder_profile.bump,
        constraint = builder_profile.active @ ErrorCode::InvalidBuilder
    )]
    pub builder_profile: Account<'info, BuilderProfile>,
    
    pub builder: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(step_type: StepType, description: String)]
pub struct LogBuildStep<'info> {
    #[account(
        mut,
        constraint = build_request.status == BuildStatus::InProgress @ ErrorCode::BuildNotInProgress,
        constraint = build_request.builder == Some(builder.key()) @ ErrorCode::Unauthorized
    )]
    pub build_request: Account<'info, BuildRequest>,
    
    #[account(
        init,
        payer = builder,
        space = 8 + BuildStep::INIT_SPACE,
        seeds = [b"step", build_request.key().as_ref(), build_request.step_count.to_le_bytes().as_ref()],
        bump
    )]
    pub build_step: Account<'info, BuildStep>,
    
    #[account(mut)]
    pub builder: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteBuild<'info> {
    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    #[account(
        mut,
        constraint = build_request.status == BuildStatus::InProgress @ ErrorCode::BuildNotInProgress,
        constraint = build_request.builder == Some(builder.key()) @ ErrorCode::Unauthorized
    )]
    pub build_request: Account<'info, BuildRequest>,
    
    #[account(
        mut,
        seeds = [b"builder", builder.key().as_ref()],
        bump = builder_profile.bump
    )]
    pub builder_profile: Account<'info, BuilderProfile>,
    
    #[account(
        mut,
        seeds = [b"escrow", build_request.key().as_ref()],
        bump
    )]
    /// CHECK: Escrow PDA for holding funds
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub builder: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: Requester receives refund if failed
    pub requester: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = admin.key() == protocol_state.admin @ ErrorCode::Unauthorized
    )]
    /// CHECK: Protocol admin receives fees
    pub admin: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterBuilder<'info> {
    #[account(
        seeds = [b"protocol"],
        bump = protocol_state.bump,
        constraint = protocol_state.admin == admin.key() @ ErrorCode::Unauthorized
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + BuilderProfile::INIT_SPACE,
        seeds = [b"builder", builder_authority.key().as_ref()],
        bump
    )]
    pub builder_profile: Account<'info, BuilderProfile>,
    
    /// CHECK: The authority that will be registered as builder
    pub builder_authority: AccountInfo<'info>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// ===== ACCOUNTS =====

#[account]
#[derive(InitSpace)]
pub struct ProtocolState {
    pub admin: Pubkey,
    pub fee_bps: u16,
    pub build_count: u64,
    pub total_builds_completed: u64,
    pub total_sol_earned: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BuildRequest {
    pub id: u64,
    pub requester: Pubkey,
    pub builder: Option<Pubkey>,
    #[max_len(500)]
    pub spec: String,
    pub budget: u64,
    pub status: BuildStatus,
    pub created_at: i64,
    pub completed_at: i64,
    #[max_len(50)]
    pub deployed_program_id: Option<String>,
    pub step_count: u32,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BuildStep {
    pub build_id: u64,
    pub step_number: u32,
    pub step_type: StepType,
    #[max_len(200)]
    pub description: String,
    pub content_hash: [u8; 32],
    pub timestamp: i64,
}

#[account]
#[derive(InitSpace)]
pub struct BuilderProfile {
    pub authority: Pubkey,
    pub builds_completed: u64,
    pub builds_failed: u64,
    pub total_earned: u64,
    pub registered_at: i64,
    pub active: bool,
    pub bump: u8,
}

// ===== ENUMS =====

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum BuildStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum StepType {
    Analyze,
    GenerateCode,
    Compile,
    Test,
    Deploy,
    GenerateSDK,
    Document,
}

// ===== EVENTS =====

#[event]
pub struct BuildRequested {
    pub build_id: u64,
    pub requester: Pubkey,
    pub spec: String,
    pub budget: u64,
    pub timestamp: i64,
}

#[event]
pub struct BuildClaimed {
    pub build_id: u64,
    pub builder: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct StepLogged {
    pub build_id: u64,
    pub step_number: u32,
    pub step_type: StepType,
    pub description: String,
    pub content_hash: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct BuildCompleted {
    pub build_id: u64,
    pub success: bool,
    pub program_id: Option<String>,
    pub timestamp: i64,
}

// ===== ERRORS =====

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Build request is not in pending status")]
    BuildNotPending,
    
    #[msg("Build request is not in progress")]
    BuildNotInProgress,
    
    #[msg("Insufficient budget")]
    InsufficientBudget,
    
    #[msg("Invalid or inactive builder")]
    InvalidBuilder,
    
    #[msg("Spec exceeds maximum length of 500 characters")]
    SpecTooLong,
    
    #[msg("Description exceeds maximum length of 200 characters")]
    DescriptionTooLong,
    
    #[msg("Program ID exceeds maximum length of 50 characters")]
    ProgramIdTooLong,
    
    #[msg("Invalid fee basis points (must be <= 10000)")]
    InvalidFeeBps,
}
