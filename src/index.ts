import moneroTs from "monero-ts";

// @ts-ignore
window.monero = moneroTs;

main();
async function main() {
  let walletKeys = await moneroTs.createWalletKeys({
    networkType: moneroTs.MoneroNetworkType.MAINNET,
    language: "English",
  });

  document.getElementById("wallet_seed_phrase")!.innerHTML =
    "Seed phrase: " + (await walletKeys.getSeed());
  document.getElementById("wallet_address")!.innerHTML =
    "Address: " + (await walletKeys.getAddress(0, 0));
  document.getElementById("wallet_spend_key")!.innerHTML =
    "Spend key: " + (await walletKeys.getPrivateSpendKey());
  document.getElementById("wallet_view_key")!.innerHTML =
    "View key: " + (await walletKeys.getPrivateViewKey());
}

export default { main };
