"use strict";
// @ts-nocheck
import { PriceFeedMinute } from "../../types";
import { OneinchABIAbi__factory } from "../../types/contracts";
import { ORACLE_ADDRESS } from "../helper";
import { CorrectSubstrateBlock } from "../mappingHandlers";
import fetch from "node-fetch";
const ETH_RPC =
  process.env.ETH_RPC ||
  "https://lb.drpc.org/ogrpc?network=ethereum&dkey=At2bhbEKA0nUjDj8Pdkc2m37qqBIxBsR768wIlZWwHzR";
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function handleNewPriceMinute({
  //   availPrice,
  //   ethPrice,
  //   ethBlock,
  //   availBlock,
  //   ethDate,
  //   availDate,
  block,
}: {
  //   availPrice: number;
  //   ethPrice: number;
  //   ethBlock: number;
  //   availBlock: number;
  //   ethDate: Date;
  //   availDate: Date;
  block: CorrectSubstrateBlock;
}): Promise<PriceFeedMinute> {
  const blockDate = new Date(Number(block.timestamp.getTime()));
  const minuteId = Math.floor(blockDate.getTime() / 60000);
  let ethBlockContext = {};
  // SKIP PRICES AT MINUTEID 28695899 - 28695894
  const availBlock = block.block.header.number.toNumber();
  if (minuteId < 28696058) {
    const priceFeedMinuteZero = PriceFeedMinute.create({
      id: minuteId.toString(),
      availBlock: availBlock,
      ethBlock: 0,
      availPrice: 0,
      ethPrice: 0,
      date: blockDate,
      availDate: blockDate,
      ethDate: blockDate,
    });
    await priceFeedMinuteZero.save();
    logger.info(`PRICE FOR THIS MINUTE EXIST :: 0 minuteId < 28696058`);
    return priceFeedMinuteZero!;
  }
  try {
    const existingPrice = await PriceFeedMinute.get(minuteId.toString());
    if (
      existingPrice &&
      (existingPrice !== null || existingPrice !== undefined)
    ) {
      logger.info(
        `PRICE FOR THIS MINUTE EXIST :: ${JSON.stringify(existingPrice)}`
      );

      return existingPrice!;
    }
    // get one day price at once
    const res = await fetch(
      `https://api.dev.dex.guru/v1/tradingview/history?symbol=0xeeb4d8400aeefafc1b2953e0094134a887c76bd8-eth_USD&resolution=1&from=${Number(
        block.timestamp.getTime() / 1000
      ).toFixed(0)}&to=${Number(
        block.timestamp.getTime() + 86400000 / 1000
      ).toFixed(
        0
      )}&currencyCode=USD&api-key=mzwVQMz5AN7Rj4UCm_wl-QsvqqpoLG6v6fjCIRfV6JU`
    );
    const data = await res.json();

    const { t, o, c, h, l } = data;

    const mappedPrices = t.map((timestamp: number | string, idx: number) => {
      const hp = h[idx];
      const lp = l[idx];
      const avgPrice = (Number(hp) + Number(lp)) / 2;

      const minuteIdOhlc = Math.floor((Number(timestamp) * 1000) / 60000);
      return {
        avgPrice,
        timestamp: Number(timestamp) * 1000,
        timestampF: new Date(new Date(Number(timestamp)).getTime() * 1000),
        minuteId: minuteIdOhlc,
      };
    });
    logger.info(`PRICE LENGTH ${mappedPrices?.length}`);
    let priceFeedThisMinute;
    for (let index = 0; index < mappedPrices.length; index++) {
      const element = mappedPrices[index];
      const priceForMinute = PriceFeedMinute.create({
        id: element?.mminuteId?.toString(),
        availBlock: availBlock,
        ethBlock: 0,
        availPrice: element?.avgPrice,
        ethPrice: 0,
        date: element?.timestampF,
        availDate: element?.timestampF,
        ethDate: element?.timestampF,
      });
      await priceForMinute.save();
      if (index === 0) {
        logger.info(
          `ZERO PRICE FOR THIS MINUTE EXIST :: ${JSON.stringify(element)}`
        );
        priceFeedThisMinute = priceForMinute;
      }
      await priceFeedThisMinute!.save();
      // return priceFeedMinuteZero!;
    }
    return priceFeedThisMinute!;
  } catch (error) {
    logger.error(`ERROR API ${error}`);
    try {
      const blockNumberApi = await fetch(
        `https://coins.llama.fi/block/ethereum/${Number(
          Math.floor(block.timestamp.getTime() / 1000)
        )}`,
        {
          method: "GET",
        }
      );
      const ethBlockContextLlama: any = await blockNumberApi.json();

      if (ethBlockContextLlama.height) {
        ethBlockContext = {
          height: Number(ethBlockContextLlama.height),
          timestamp: Number(block.timestamp.getTime() / 1000),
          blockHex: `0x${ethBlockContextLlama.height.toString(16)}`,
        };
      } else {
        await delay(1_000);
        const blockNumberApiEtherscan = await fetch(
          `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${Number(
            Math.floor(block.timestamp.getTime() / 1000)
          )}&closest=before&apikey=QW2D5TW4VG4BYK8I5G6WMUCA9ENWGAHUYJ`,
          {
            method: "GET",
          }
        );
        const ethBlockContextEtherescan: any =
          await blockNumberApiEtherscan.json();
        if (ethBlockContextEtherescan.result) {
          ethBlockContext = {
            height: Number(ethBlockContextEtherescan.result),
            timestamp: Number(block.timestamp.getTime() / 1000),
          };
        }
        //
      }
    } catch (error) {
      try {
        await delay(1_000);
        const blockNumberApiEtherscan = await fetch(
          `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${Number(
            Math.floor(block.timestamp.getTime() / 1000)
          )}&closest=before&apikey=QW2D5TW4VG4BYK8I5G6WMUCA9ENWGAHUYJ`,
          {
            method: "GET",
          }
        );
        const ethBlockContextEtherescan: any =
          await blockNumberApiEtherscan.json();
        if (ethBlockContextEtherescan.result) {
          ethBlockContext = {
            height: Number(ethBlockContextEtherescan.result),
            timestamp: Number(block.timestamp.getTime() / 1000),
            blockHex: `0x${Number(ethBlockContextEtherescan.result).toString(
              16
            )}`,
          };
        }
      } catch (error) {
        // const priceFeedLastMinute = await PriceFeedMinute.get(
        //   (Number(minuteId) - 1).toString()
        // );
        // if (priceFeedLastMinute) {
        //   return priceFeedLastMinute!;
        // } else {
        return await handleNewPriceMinute({ block });
        // throw error;
        // }
      }

      //
    }
    // logger.info(
    //   `Expected ETH BLOCK::::::  ${JSON.stringify(ethBlockContext)} AT ${Number(
    //     block.timestamp.getTime() / 1000
    //   )} ::: Date :: ${blockDate}`
    // );
    try {
      let priceFeedMinute = await PriceFeedMinute.get(minuteId.toString());

      if (priceFeedMinute === undefined || priceFeedMinute === null) {
        // await delay(250);
        const ife = OneinchABIAbi__factory.createInterface();
        const encodedEth = ife.encodeFunctionData("getRate", [
          "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
          "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
          false,
        ]);
        const encodedAvail = ife.encodeFunctionData("getRate", [
          "0xEeB4d8400AEefafC1B2953e0094134A887C76Bd8", // WETH
          "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
          false,
        ]);

        const rpcDataEth = await fetch(ETH_RPC, {
          method: "POST",
          headers: {},
          body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                to: ORACLE_ADDRESS,
                data: encodedEth,
              },
              // @ts-ignore
              `0x${ethBlockContext.height.toString(16)}`,
            ],
          }),
        });
        const rpcDataAvail = await fetch(ETH_RPC, {
          method: "POST",
          headers: {},
          body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                to: ORACLE_ADDRESS,
                data: encodedAvail,
              },
              // @ts-ignore
              `0x${ethBlockContext.height.toString(16)}`,
            ],
          }),
        });
        const ethResultRaw: any = await rpcDataEth.json();
        const availResultRaw: any = await rpcDataAvail.json();
        // if (ethResultRaw) {
        //   logger.info(
        //     `RAW ETH Price Feed::::::  ${JSON.stringify(ethResultRaw)}`
        //   );
        // }
        const decodedEth = ife.decodeFunctionResult(
          "getRate",
          ethResultRaw.result
        );
        const decodedAvail = ife.decodeFunctionResult(
          "getRate",
          availResultRaw.result
        );

        // if (decodedEth) {
        //   logger.info(`New ETH Price Feed::::::  ${decodedEth.toString()}`);
        // }
        // if (decodedAvail) {
        //   logger.info(`New AVAIL Price Feed::::::  ${decodedAvail.toString()}`);
        // }

        const availPrice = Number(decodedAvail.toString()) / 1e6;
        const ethPrice = Number(decodedEth.toString()) / 1e6;
        const availDate = blockDate;
        // @ts-ignore
        const ethBlock = Number(ethBlockContext.height);
        // @ts-ignore
        const ethDate = new Date(Number(ethBlockContext.timestamp) * 1000);
        priceFeedMinute = PriceFeedMinute.create({
          id: minuteId.toString(),
          availPrice,
          ethPrice,
          availBlock,
          ethBlock,
          availDate,
          ethDate,
        });
        priceFeedMinute.availPrice = availPrice;
        priceFeedMinute.ethPrice = ethPrice;
        // logger.info(
        //   `SAVING NEW PRICE MINUTE ::::  ${priceFeedMinute.ethPrice.toString()} :: ID:: ${minuteId} :: AT:: ${blockDate}`
        // );
        await priceFeedMinute.save();
      } else {
        // logger.info(
        //   `PRICE ALREADY EXIST ::::  ${priceFeedMinute.ethPrice.toString()} :: ID:: ${minuteId} :: AT:: ${blockDate}`
        // );
      }

      // logger.info(
      //   `New AVAIL Price Feed Minute::::::  ${priceFeedMinute.availPrice.toString()} :: ID:: ${minuteId} :: AT:: ${blockDate}`
      // );
      return priceFeedMinute;
    } catch (error) {
      // const priceFeedLastMinute = await PriceFeedMinute.get(
      //   (Number(minuteId) - 1).toString()
      // );
      // if (priceFeedLastMinute) {
      //   return priceFeedLastMinute!;
      // } else {
      return await handleNewPriceMinute({ block });
      //   throw error;
      // }
    }
  }
}
