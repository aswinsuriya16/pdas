use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction::create_account,
};

entrypoint!(process_instruction);

fn process_instruction (
    _program_id : &Pubkey,
    accounts : &[AccountInfo],
    instruction_data : &[u8],
)->ProgramResult {
    let mut iter = accounts.iter();
    let pda = next_account_info(&mut iter)?;
    let user_acc = next_account_info(&mut iter)?;
    let sys_prog = next_account_info(&mut iter)?;

    //seed for pda derivation

    let seeds = &[user_acc.key.as_ref() , b"userseed"]; // b"asdsdas" ->the string in bytes

    let (pda_pubkey,bump) = Pubkey::find_program_address(seeds, _program_id);
    //Pubkey::create_program_address(seeds , _program_id); in this we need to give the bump seed (255..0)

    let signer_seeds = &[user_acc.key.as_ref(), b"userseed", &[bump]]; 

    let instruction = create_account(user_acc.key, pda.key, 1000000000, 8, _program_id);

    invoke_signed(&instruction, accounts, &[signer_seeds])
}