import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithinSizeLimit,
  compileTransaction,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import wallet from "./dev-wallet.json";
import * as dotenv from "dotenv";
dotenv.config();

const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

const turbin3Address = process.env.TURBIN3_ADDRESS;

if (!turbin3Address) {
  throw new Error("TURBIN3_ADDRESS not found in .env");
}

// Define our Turbin3 wallet to send to
const turbin3Wallet = address(turbin3Address);

// Create an rpc connection
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(
  devnet("ws://api.devnet.solana.com")
);

// First get the balance from our wallet
const { value: balance } = await rpc.getBalance(keypair.address).send();

// Build a dummy transfer instruction with 0 amount to calculate the fee
const dummyTransferInstruction = getTransferSolInstruction({
  source: keypair,
  destination: turbin3Wallet,
  amount: lamports(0n),
});

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const dummyTransactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([dummyTransferInstruction], tx)
);

// Compile the dummy transaction message to get the message bytes
const compiledDummy = compileTransaction(dummyTransactionMessage);
const dummyMessageBase64 = Buffer.from(compiledDummy.messageBytes).toString(
  "base64"
) as TransactionMessageBytesBase64;

// Calculate the transaction fee
const { value: fee } =
  (await rpc.getFeeForMessage(dummyMessageBase64).send()) || 0n;

if (fee === null) {
  throw new Error("Unable to calculate transaction fee");
}

if (balance < fee) {
  throw new Error(`Insufficient balance to cover the transaction fee.
        Balance: ${balance}, Fee: ${fee}`);
}

// Calculate the exact amount to send (balance minus fee)
const sendAmount = balance - fee;

// Build the transfer instruction
const transferInstruction = getTransferSolInstruction({
  source: keypair,
  destination: turbin3Wallet,
  amount: lamports(sendAmount),
});

const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
);

const signedTransaction = await signTransactionMessageWithSigners(
  transactionMessage
);

assertIsTransactionWithinSizeLimit(signedTransaction);

const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
  rpc,
  rpcSubscriptions,
});

try {
  await sendAndConfirmTransaction(signedTransaction, {
    commitment: "confirmed",
  });
  const signature = getSignatureFromTransaction(signedTransaction);
  console.log(`Success! Check out your TX here:
https://explorer.solana.com/tx/${signature}?cluster=devnet`);
} catch (e) {
  console.error("Transfer failed:", e);
}
