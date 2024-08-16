import assert from "assert";
import moneroTs from "monero-ts";

// @ts-ignore
window.monero = moneroTs;

main();
testSampleCode();

async function main() {

  // create keys wallet
  let walletKeys = await moneroTs.createWalletKeys({
    networkType: moneroTs.MoneroNetworkType.MAINNET,
    language: "English",
  });

  // display keys
  document.getElementById("wallet_seed_phrase")!.innerHTML = "Seed phrase: " + (await walletKeys.getSeed());
  document.getElementById("wallet_address")!.innerHTML = "Address: " + (await walletKeys.getAddress(0, 0));
  document.getElementById("wallet_spend_key")!.innerHTML = "Spend key: " + (await walletKeys.getPrivateSpendKey());
  document.getElementById("wallet_view_key")!.innerHTML = "View key: " + (await walletKeys.getPrivateViewKey());
}

async function testSampleCode() {

  // TODO: get failures in the browser making http requests without worker proxy: 
  /* TypeError: Cannot read properties of undefined (reading 'call')
        at m.sendJsonRequest (index.js:478:11292)
        at async T.getHeight (index.js:496:42372)
        at async tA (index.js:505:106455) */
  // connect to mainnet daemon without worker proxy
  let daemon1 = await moneroTs.connectToDaemonRpc({server: "https://node.sethforprivacy.com:18089", proxyToWorker: false});
  console.log("Daemon height 1: " + await daemon1.getHeight());

  // TODO: get failures in the browser using web worker: "fetch is not a function"
  /* TypeError: r.g.fetch is not a function
        at h._onFinish (monero_web_worker.js:2:1543631)
        at e.exports.<anonymous> (monero_web_worker.js:2:1542602)
        at a.emit (monero_web_worker.js:2:1007398) */
  // connect to mainnet daemon with worker proxy
  let daemon2 = await moneroTs.connectToDaemonRpc({server: "https://node.sethforprivacy.com:18089", proxyToWorker: true});
  console.log("Daemon height 2: " + await daemon2.getHeight());

  // connect to a daemon
  console.log("Connecting to daemon");
  let daemon = await moneroTs.connectToDaemonRpc("http://localhost:28081");
  let height = await daemon.getHeight();            // 1523651
  let feeEstimate = await daemon.getFeeEstimate();  // 1014313512
  let txsInPool = await daemon.getTxPool();         // get transactions in the pool
  
  // create wallet from seed phrase using WebAssembly bindings to monero-project
  console.log("Creating wallet from seed phrase");
  let walletFull = await moneroTs.createWalletFull({
    password: "supersecretpassword123",
    proxyToWorker: false,
    networkType: moneroTs.MoneroNetworkType.TESTNET,
    seed: "silk mocked cucumber lettuce hope adrenalin aching lush roles fuel revamp baptism wrist long tender teardrop midst pastry pigment equip frying inbound pinched ravine frying",
    restoreHeight: 171,
    server: {
      uri: "http://localhost:28081",
      username: "superuser",
      password: "abctesting123"
    }
  });
  
  // synchronize with progress notifications
  console.log("Synchronizing wallet");
  await walletFull.sync(new class extends moneroTs.MoneroWalletListener {
    async onSyncProgress(height: number, startHeight: number, endHeight: number, percentDone: number, message: string) {
      // feed a progress bar?
    }
  });
  
  // synchronize in the background
  await walletFull.startSyncing(5000);
  
  // listen for incoming transfers
  let fundsReceived = false;
  await walletFull.addListener(new class extends moneroTs.MoneroWalletListener {
    async onOutputReceived(output: moneroTs.MoneroOutputWallet) {
      let amount = output.getAmount();
      let txHash = output.getTx().getHash();
      fundsReceived = true;
    }
  });

  // open wallet on monero-wallet-rpc
  console.log("Opening monero-wallet-rpc");
  let walletRpc = await moneroTs.connectToWalletRpc("http://localhost:28084", "rpc_user", "abc123");
  await walletRpc.openWallet("test_wallet_1", "supersecretpassword123");
  let primaryAddress = await walletRpc.getPrimaryAddress(); // 555zgduFhmKd2o8rPUz...
  let balance = await walletRpc.getBalance();               // 533648366742
  let txs = await walletRpc.getTxs();                       // get transactions containing transfers to/from the wallet

  // send funds from RPC wallet to WebAssembly wallet
  console.log("Transferring funds from monero-wallet-rpc");
  let createdTx = await walletRpc.createTx({
    accountIndex: 0,
    address: await walletFull.getAddress(1, 0),
    amount: 5000000n, // amount to transfer in atomic units
    relay: false // create transaction and relay to the network if true
  });
  let fee = createdTx.getFee(); // "Are you sure you want to send... ?"
  await walletRpc.relayTx(createdTx); // relay the transaction
  
  // recipient receives unconfirmed funds within 5s seconds
  await new Promise(function(resolve) { setTimeout(resolve, 5000); });
  assert(fundsReceived);
  
  // close wallets
  console.log("Closing wallets");
  await walletFull.close();
  await walletRpc.close();
  console.log("Done running XMR sample app");
}