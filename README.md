# airdrop

Scripts for interacting with Solana devnet:

- `keygen`: generate a local dev wallet file `dev-wallet.json`.
- `airdrop`: request 2 SOL to `dev-wallet.json`.
- `transfer`: send all SOL (minus fee) from `dev-wallet.json` to `TURBIN3_ADDRESS`.
- `decode`: convert a Base58 private key to raw bytes and save as `Turbin3-wallet.json`.
- `generate-client`: generate the JS client from `programs/Turbin3-prereq.json` into `clients/js/src/generated/`.
- `enroll`: call on-chain program instructions using `Turbin3-wallet.json` and a generated JS client.

## Prerequisites
- Node.js 18+ (Node 20/22/24 OK). Yarn 4 via Corepack.

If Corepack is not enabled:
```bash
corepack enable
```

## Install
```bash
yarn install
```

This repo uses Yarn’s node-modules linker (`.yarnrc.yml`).

## Wallet files
- `dev-wallet.json`: used by `airdrop.ts` and `transfer.ts`.
  - Create via: `yarn keygen` (saves a new wallet to `dev-wallet.json`).
- `Turbin3-wallet.json`: used by `enroll.ts`.
  - Create via: `yarn decode` and paste your Base58 secret key; it writes the raw byte array.

## Environment
Create a `.env` file for transfer destination:
```
TURBIN3_ADDRESS=ENTER_DESTINATION_ADDRESS
```

## Usage

- Keygen a dev wallet:
```bash
yarn keygen
```

- Airdrop 2 SOL to your dev wallet on devnet:
```bash
yarn airdrop
```

- Transfer all SOL (minus fee) to `TURBIN3_ADDRESS` from `.env`:
```bash
yarn transfer
```

- Decode a Base58 private key to `Turbin3-wallet.json`:
```bash
yarn decode
```

- Enroll (requires `Turbin3-wallet.json` and generated client):
```bash
yarn generate-client
yarn enroll
```

## Files of interest
- `airdrop.ts`: uses `dev-wallet.json` to request SOL via `airdropFactory`.
- `transfer.ts`: sends lamports to `TURBIN3_ADDRESS` after computing exact fee.
- `decode.ts`: writes `Turbin3-wallet.json` from Base58.
- `enroll.ts`: derives PDAs, sends `initialize` then `submitTs` using addresses:
  - Program: `TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM`
  - MPL Core: `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`
  - Collection: `5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2`
