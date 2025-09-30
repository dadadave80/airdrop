import fs from "fs";
import bs58 from "bs58";

const data = JSON.parse(fs.readFileSync("dev-wallet.json", "utf8"));

let walletBytes = Uint8Array.from(Buffer.from(data, "base58"));

const base58 = bs58.encode(walletBytes);

console.log(base58);
