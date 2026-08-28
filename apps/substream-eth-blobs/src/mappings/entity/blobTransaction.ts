import {
  BigDecimal,
  BigInt,
  ByteArray,
  Bytes,
  log,
  Value,
} from "@graphprotocol/graph-ts";
import { BlobTransaction } from "../../../generated/schema";
import { Block } from "../../pb/sf/ethereum/type/v2/clone/Block";
import { TransactionTrace } from "../../pb/sf/ethereum/type/v2/clone/TransactionTrace";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../../utils/constants";
import { handleBlobsCollective } from "./collectiveData";
import { handleBlobBlockBlobs } from "./blobBlock";
import { handleBlobsAccount } from "./blobAccount";
export function handleBlobTransaction(txn: TransactionTrace, blk: Block): void {
  const hash = Bytes.fromUint8Array(txn.hash);
  const from = Bytes.fromUint8Array(txn.from).toHexString();
  const to = Bytes.fromUint8Array(txn.to).toHexString();
  const publicKey = Bytes.fromUint8Array(txn.publicKey).toHexString();
  const returnData = Bytes.fromUint8Array(txn.returnData).toHexString();
  const input = Bytes.fromUint8Array(txn.input).toHexString();
  const blockNumber = new BigDecimal(BigInt.fromU64(blk.number));

  let transactionEntity = BlobTransaction.load(hash);
  if (transactionEntity === null) {
    transactionEntity = new BlobTransaction(hash);
    transactionEntity.to = to;
    transactionEntity.from = from;
    transactionEntity.miner = "";

    transactionEntity.hash = hash.toHexString();
    transactionEntity.nonce = BigInt.fromU64(txn.nonce);
    transactionEntity.gasLimit = new BigDecimal(BigInt.fromU64(txn.gasLimit));
    transactionEntity.blobGas = new BigDecimal(BigInt.fromU64(txn.blobGas));
    transactionEntity.gasUsed = new BigDecimal(BigInt.fromU64(txn.gasUsed));
    transactionEntity.publicKey = publicKey;
    transactionEntity.returnData = returnData;
    transactionEntity.index = new BigDecimal(BigInt.fromU32(txn.index));
    transactionEntity.input = input;
    transactionEntity.status = BigDecimal.fromString(txn.status.toString());
    transactionEntity.blockNumber = blockNumber;

    transactionEntity.blobGasUSD = ZERO_BD;
    transactionEntity.totalFeeUSD = ZERO_BD;
    transactionEntity.currentEthPrice = ZERO_BD;
    transactionEntity.totalFeeBurnedETH = ZERO_BD;
    transactionEntity.totalFeeBurnedUSD = ZERO_BD;
    if (blk.header != null) {
      if (blk.header!.coinbase !== null) {
        const coinbaseHex = Bytes.fromUint8Array(
          blk.header!.coinbase!
        ).toHexString();
        transactionEntity.miner = coinbaseHex;
      }
    }
    if (txn.receipt !== null && txn.receipt!.cumulativeGasUsed! !== null) {
      transactionEntity.cumulativeGasUsed = new BigDecimal(
        BigInt.fromU64(txn.receipt!.cumulativeGasUsed!)
      );
    }
    if (txn.receipt !== null && txn.receipt!.blobGasPrice! !== null) {
      const blobGasPriceHex = Bytes.fromUint8Array(
        txn.receipt!.blobGasPrice!.bytes!
      ).toHexString();
      const blobGasPriceNumber = parseInt(blobGasPriceHex, 16);
      transactionEntity.blobGasPrice = BigDecimal.fromString(
        isNaN(blobGasPriceNumber) ? "0" : blobGasPriceNumber.toString()
      );
    }
    if (txn.receipt !== null && txn.receipt!.stateRoot! !== null) {
      const stateRoot = Bytes.fromUint8Array(
        txn.receipt!.stateRoot!
      ).toHexString();
      transactionEntity.stateRoot = stateRoot;
    }
    let hashes: string[] = [];
    for (let index = 0; index < txn.blobHashes.length; index++) {
      const blobHashRaw = txn.blobHashes[index];
      const blobHash = Bytes.fromUint8Array(blobHashRaw).toHexString();
      hashes.push(blobHash);
    }
    transactionEntity.blobHashes = hashes;
    transactionEntity.blobHashesLength = BigDecimal.fromString(
      hashes.length.toString()
    );
    log.info("BEFORE :: txn.gasPrice", []);

    // transactionEntity.gasPrice = new BigInt(txn.gasPrice);
    if (txn.gasPrice !== null) {
      if (txn.gasPrice!.bytes! !== null) {
        const gasPriceHex = Bytes.fromUint8Array(
          txn.gasPrice!.bytes!
        ).toHexString();
        const gasPriceU64 = Bytes.fromUint8Array(txn.gasPrice!.bytes!).toU64();

        const gasPriceNumber = parseInt(gasPriceHex, 16);
        log.info(
          "handleBlobTransaction ::: gasPriceHex : {} -- gasPriceU64 :: {} -- num :{}::{}",
          [
            gasPriceHex,
            BigInt.fromU64(gasPriceU64).toString(),
            gasPriceNumber.toString(),
            BigDecimal.fromString(
              isNaN(gasPriceNumber) ? "0" : gasPriceNumber.toString()
            ).toString(),
          ]
        );
        transactionEntity.gasPrice = BigDecimal.fromString(
          isNaN(gasPriceNumber) ? "0" : gasPriceNumber.toString()
        );
      }
    }
    log.info("BEFORE :: txn.value", []);

    if (txn.value !== null) {
      if (txn.value!.bytes !== null && txn.value!.bytes!.toString() !== "") {
        const valueHex = Bytes.fromUint8Array(txn.value!.bytes!).toHexString();
        const valueNumber = parseInt(valueHex, 16);
        log.info("BEFORE :: txn.valueNumber {} hex {} vb {}", [
          valueNumber.toString(),
          valueHex,
          txn.value!.bytes.toString(),
        ]);
        transactionEntity.value = BigDecimal.fromString(
          isNaN(valueNumber) ? "0" : valueNumber.toString()
        );
      }
    }
    log.info("BEFORE :: txn.blobGasFeeCap", []);

    if (txn.blobGasFeeCap !== null) {
      log.info("BEFORE :: txn.blobGasFeeCap INSIDE {}", [
        txn!.blobGasFeeCap!.bytes!.toString(),
      ]);

      if (txn.blobGasFeeCap!.bytes !== null) {
        const blobGasFeeCapHex = Bytes.fromUint8Array(
          txn.blobGasFeeCap!.bytes!
        ).toHexString();
        const blobGasFeeCapNumber = parseInt(blobGasFeeCapHex, 16);
        transactionEntity.blobGasFeeCap = BigDecimal.fromString(
          isNaN(blobGasFeeCapNumber) ? "0" : blobGasFeeCapNumber.toString()
        );
      }
    }
    log.info("BEFORE :: txn.maxFeePerGas", []);

    if (txn.maxFeePerGas !== null) {
      log.info("BEFORE :: txn.blobGasFeeCap INSIDE {}", [
        txn!.maxFeePerGas!.bytes!.toString(),
      ]);

      if (txn.maxFeePerGas!.bytes !== null) {
        const maxFeePerGasHex = Bytes.fromUint8Array(
          txn.maxFeePerGas!.bytes!
        ).toHexString();
        const maxFeePerGasNumber = parseInt(maxFeePerGasHex, 16);
        transactionEntity.maxFeePerGas = BigDecimal.fromString(
          isNaN(maxFeePerGasNumber) ? "0" : maxFeePerGasNumber.toString()
        );
      }
    }
    log.info("BEFORE :: txn.maxPriorityFeePerGas", []);

    if (txn.maxPriorityFeePerGas !== null) {
      log.info("BEFORE :: txn.blobGasFeeCap INSIDE {}", [
        txn!.maxPriorityFeePerGas!.bytes!.toString(),
      ]);
      if (txn.maxPriorityFeePerGas!.bytes !== null) {
        const maxPriorityFeePerGasHex = Bytes.fromUint8Array(
          txn.maxPriorityFeePerGas!.bytes!
        ).toHexString();
        const maxPriorityFeePerGasNumber = parseInt(
          maxPriorityFeePerGasHex,
          16
        );
        transactionEntity.maxPriorityFeePerGas = BigDecimal.fromString(
          isNaN(maxPriorityFeePerGasNumber)
            ? "0"
            : maxPriorityFeePerGasNumber.toString()
        );
      }
    }
    log.info("BEFORE :: totalBlobGasEth", []);

    const totalBlobGasEth =
      transactionEntity.blobGas!.times(transactionEntity.blobGasPrice!) ||
      ZERO_BD;
    transactionEntity.blobGasEth = totalBlobGasEth;
    const totalFeeEth =
      transactionEntity.gasUsed!.times(transactionEntity.gasPrice!) || ZERO_BD;
    transactionEntity.totalFeeEth = totalFeeEth;
    log.info("BEFORE :: ethPriceChainlink {}", [
      blk!.ethPriceChainlink!.toString(),
    ]);
    if (totalBlobGasEth !== null) {
      transactionEntity.blobGasUSD = BigDecimal.fromString(
        blk.ethPriceChainlink.toString()
      ).times(totalBlobGasEth);
    }
    if (totalFeeEth !== null) {
      transactionEntity.totalFeeUSD = BigDecimal.fromString(
        blk.ethPriceChainlink.toString()
      ).times(totalFeeEth);
    }
    transactionEntity.currentEthPrice = BigDecimal.fromString(
      blk.ethPriceChainlink.toString()
    );
    if (blk.header !== null) {
      if (blk.header!.baseFeePerGas !== null) {
        log.info("BEFORE :: txn.blobGasFeeCap INSIDE {}", [
          blk.header!.baseFeePerGas!.bytes!.toString(),
        ]);
        const baseFeePerGasHex = Bytes.fromUint8Array(
          blk.header!.baseFeePerGas!.bytes!
        ).toHexString();
        const baseFeePerGasHexNumber = parseInt(baseFeePerGasHex, 16);
        transactionEntity.totalFeeBurnedETH =
          transactionEntity.totalFeeBurnedETH.plus(
            BigDecimal.fromString(baseFeePerGasHexNumber.toString()).times(
              transactionEntity.gasUsed!
            )
          );
        transactionEntity.totalFeeBurnedUSD =
          transactionEntity.totalFeeBurnedUSD.plus(
            transactionEntity.totalFeeBurnedETH.times(
              BigDecimal.fromString(blk.ethPriceChainlink.toString())
            )
          );
      }
    }
  }
  const timestamp = blk.header!.timestamp!;

  transactionEntity.timestamp = new BigDecimal(
    BigInt.fromI64(timestamp.seconds)
  );

  handleBlobsCollective(transactionEntity, blk);
  handleBlobBlockBlobs(transactionEntity, blk);
  handleBlobsAccount(transactionEntity, blk, transactionEntity.from, ONE_BI);
  if (blk.header != null) {
    if (blk.header!.coinbase !== null) {
      const coinbaseHex = Bytes.fromUint8Array(
        blk.header!.coinbase!
      ).toHexString();
      handleBlobsAccount(
        transactionEntity,
        blk,

        coinbaseHex,
        BigInt.fromString("2")
      );
    }
  }

  transactionEntity.save();
}
