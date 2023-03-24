require("buffer");

const { TonClient, WalletContractV4, internal } = require('ton');
const { mnemonicNew, mnemonicToPrivateKey } = require('ton-crypto');
const TonWeb = require('tonweb');
const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', { apiKey: '4c7189ce89a0cb08c1bf0836e0c1849cfb210b55f582e952ef11fb008217199e' }));

// const { getHttpEndpoint } = require('@orbs-network/ton-access');
// const endpoint = await getHttpEndpoint();
// const client = new TonClient({
//     endpoint,
//     apiKey: '4c7189ce89a0cb08c1bf0836e0c1849cfb210b55f582e952ef11fb008217199e'
// });

const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: '4c7189ce89a0cb08c1bf0836e0c1849cfb210b55f582e952ef11fb008217199e'
});
const axios = require('axios');


async function _wallet(req) {
    let keyPair = await _keyPair(req);
    const publicKey = keyPair.publicKey;
    const wallet = WalletContractV4.create({ publicKey: publicKey, workchain: 0 });
    return wallet;
}

async function _keyPair(req) {
    let mnemonic = req.mnemonic;
    let mnemonics = await mnemonicNew();
    if (mnemonic != null) {
        mnemonics = mnemonic.split(' ');
    }
    if (mnemonic == null) {
        mnemonic = mnemonics.join(' ');
    }
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    return keyPair;
}

async function getWalletV2(req) {
    const mnemonic = req.mnemonic;
    const wallet = await _wallet(req);
    return {
        address: wallet.address.toString(true, true, false),
        getBalance: await wallet.getBalance(),
        mnemonic: mnemonic,
    };
}

// async function sendTonV2(req) {
//     try {
//         let mnemonic = req.mnemonic;
//         let toAddress = req.toAddress;
//         let amount = req.amount;
//         let payload = req.payload;
//         let mnemonics = await mnemonicNew();
//         if (mnemonic != null) {
//             mnemonics = mnemonic.split(' ');
//         }
//         if (mnemonic == null) {
//             return { error: 'mnemonic null' };
//         }
//         let keyPair = await mnemonicToPrivateKey(mnemonics);
//         const publicKey = keyPair.publicKey;
//         const secretKey = keyPair.secretKey;

//         const wallet = tonweb.wallet.create({ publicKey });
//         const address = await wallet.getAddress();
//         const nonBounceableAddress = address.toString(true, true, false);

//         const seqno = await wallet.methods.seqno().call();

//         await wallet.deploy(secretKey).send();

//         const fee = await wallet.methods.transfer({
//             secretKey,
//             toAddress: toAddress,
//             amount: TonWeb.utils.toNano(amount),
//             seqno: seqno,
//             payload: payload,
//             sendMode: 3,
//         }).estimateFee();

//         const Cell = TonWeb.boc.Cell;
//         const cell = new Cell();
//         cell.bits.writeUint(0, 32);
//         cell.bits.writeAddress(address);
//         cell.bits.writeGrams(1);
//         const bocBytes = cell.toBoc();

//         const history = await tonweb.getTransactions(address);
//         const balance = await tonweb.getBalance(address);

//         const sendBoc = tonweb.sendBoc(bocBytes);
//         nonBounceableAddress
//         return {
//             sendBoc: sendBoc,
//             fee: fee,
//             nonBounceableAddress: nonBounceableAddress,
//         };
//     } catch (e) {
//         return { error: `${e}` };
//     }
// }

async function getTransactions(req) {
    const wallet = await _wallet(req);
    const address = wallet.address;
    const history = await tonweb.getTransactions(address);
    const map = {
        transactions: history,
    };
    return map;
}

async function getBalance(req) {
    const wallet = await _wallet(req);
    const address = wallet.address;
    const balance = await tonweb.getBalance(address);
    const map = {
        balance: balance,
    };

    return map;
}

// async function sendTon(req) {
//     try {
//         let mnemonic = req.mnemonic;
//         let toAddress = req.toAddress;
//         let amount = req.amount;
//         let payload = req.payload;
//         let mnemonics = await mnemonicNew();
//         if (mnemonic != null) {
//             mnemonics = mnemonic.split(' ');
//         }
//         if (mnemonic == null) {
//             mnemonic = mnemonics.join(' ');
//         }
//         let keyPair = await mnemonicToPrivateKey(mnemonics);
//         const publicKey = keyPair.publicKey;
//         const wallet = WalletContractV4.create({ publicKey: publicKey, workchain: 0 });

//         let seqno = await wallet.getSeqno();
//         if (seqno == null) {
//             await wallet.deploy(secretKey).send();
//             seqno = await wallet.methods.getSeqno();
//         }
//         const fee = await wallet.methods.transfer({
//             secretKey,
//             toAddress: toAddress,
//             amount: TonWeb.utils.toNano(amount),
//             seqno: seqno,
//             payload: payload,
//             sendMode: 3,
//         }).estimateFee();
//         const address = await wallet.getAddress();
//         const Cell = TonWeb.boc.Cell;
//         const cell = new Cell();
//         cell.bits.writeUint(0, 32);
//         cell.bits.writeAddress(address);
//         cell.bits.writeGrams(1);
//         const bocBytes = cell.toBoc();
//         const history = await tonweb.getTransactions(address);
//         const balance = await tonweb.getBalance(address);
//         const sendBoc = await tonweb.sendBoc(bocBytes);

//         return { sendBoc: sendBoc, history: history, balance: balance };
//     } catch (e) { return { 'error': `${e}` }; }

// }

async function sendTon2(req) {
    try {
        const wallet = await _wallet(req);
        let contract = client.open(wallet);
        // Create a transfer
        let seqno = await contract.getSeqno();
        let transfer = await contract.sendTransfer({
            seqno: seqno,
            secretKey: secretKey,
            messages: [
                internal({
                    to: toAddress,
                    value: amount,
                    body: payload,
                })
            ]
        });
        return { sendTransfer: transfer };
        // const endpoint = await getHttpEndpoint({ network: "mainnet" });
        // const client = new TonClient({ endpoint });

        // const walletContract = client.open(wallet);
        // let seqno = await walletContract.getSeqno();

        // const sendTransfer = await walletContract.sendTransfer({
        //     secretKey: secretKey,
        //     seqno: seqno,
        //     messages: [
        //         internal({
        //             to: toAddress,
        //             value: amount,
        //             body: payload,
        //             bounce: false,
        //         })
        //     ]
        // });
        // return { sendTransfer: sendTransfer };

    } catch (e) { return { 'error': `${e}` }; }


}

async function getPoolInfo(req) {
    const address = req.address;
    const link = `https://api.ton.cat/v2/contracts/address/${address}`;
    const explorer = await axios({
        method: 'get',
        url: link,
    });
    const data = explorer.data;
    return data;
}

async function getPoolTransactions(req) {
    const address = req.address;
    const limit = req.limit;
    const offset = req.offset;
    const link = `https://api.ton.cat/v2/contracts/address/${address}/transactions?limit=${limit}&offset=${offset}`;
    const explorer = await axios({
        method: 'get',
        url: link,
    });
    const data = explorer.data;
    return data;
}

async function getPoolTransactionsByHash(req) {
    const hash = req.hash;
    const link = `https://toncenter.com/api/index/getTransactionByHash?tx_hash=${hash}&include_msg_body=true`;
    const explorer = await axios({
        method: 'get',
        url: link,
    });
    const data = explorer.data;
    return data;
}

module.exports = {
    getTransactions: getTransactions,
    getPoolTransactions: getPoolTransactions,
    getPoolTransactionsByHash: getPoolTransactionsByHash,
    getBalance: getBalance,
    // sendTon: sendTon,
    getPoolInfo: getPoolInfo,
    sendTon: sendTon2,
    getWallet: getWalletV2,
    // sendTon: sendTonV2,
};
