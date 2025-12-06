import { Keypair, Connection, SystemProgram, Transaction } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899");

async function main() {
  console.log("Hello, Name Client!");

  const kp = Keypair.generate();
  const dataaccount = Keypair.generate();

  console.log("New wallet:", kp.publicKey.toBase58());

  const sig = await connection.requestAirdrop(kp.publicKey, 3e9);
  await connection.confirmTransaction(sig);

  const balance = await connection.getBalance(kp.publicKey);
  console.log("Balance:", balance);

  // Create account instruction
  const instruction = SystemProgram.createAccount({
    fromPubkey: kp.publicKey,
    newAccountPubkey: dataaccount.publicKey,
    lamports: 1e9,
    space: 100,
    programId: SystemProgram.programId,
  });

  const tx = new Transaction().add(instruction);

  tx.feePayer = kp.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  // ❗ SIGN WITH BOTH KEYS
  tx.sign(kp, dataaccount);

  
  const txid = await connection.sendRawTransaction(tx.serialize());
  
  await connection.confirmTransaction(txid);

  console.log("Created data account:", dataaccount.publicKey.toBase58());
  console.log("Tx Signature:", txid);
}

main();
