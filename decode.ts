import { writeFile } from "fs/promises";
import { createInterface } from "readline";
import bs58 from "bs58";

async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const base58Key: string = await new Promise((resolve) =>
    rl.question("Enter your Base58 private key: ", resolve),
  );

  rl.close();

  try {
    const walletBytes = bs58.decode(base58Key);

    await writeFile(
      "Turbin3-wallet.json",
      JSON.stringify(Array.from(walletBytes), null, 0),
    );

    console.log("✅ Wallet bytes saved to Turbin3-wallet.json");
  } catch (err) {
    console.error("❌ Invalid Base58 key:", err);
  }
}

main();
