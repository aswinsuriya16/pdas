import { test, expect, beforeAll, describe } from "bun:test";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";

describe("Create PDA from client", () => {
  let pda: PublicKey;
  let bump: number;
  let programId: PublicKey;
  let payer: Keypair;
  const connection = new Connection("https://api.devnet.solana.com");

  beforeAll(async () => {
    payer = Keypair.generate();
    programId = new PublicKey("Fp5cKf2o8eSqCiw9EzUfu7EE7HRKijPTC6pCHpzpKHqJ"); // deployed programid

    const airdrop = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL * 2);
    await connection.confirmTransaction(airdrop, "confirmed");

    [pda, bump] = PublicKey.findProgramAddressSync(
      [payer.publicKey.toBuffer(), Buffer.from("userseed")],
      programId
    );

    const ix = new TransactionInstruction({
      keys: [
        { pubkey: pda, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId,
      data: Buffer.from([]),
    });

    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  });

  test("should create PDA", async () => {
    const info = await connection.getAccountInfo(pda);
    expect(info).toBeTruthy();
    expect(info?.lamports || 0).toBeGreaterThan(0);
    console.log("PDA balance:", info?.lamports);
  });
});
