import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const _ = require("lodash");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const numberFormater = Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});
export const numberFormaterNoCompact = Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
export const numberFormat = {
  format: (num: number) => {
    if (num >= 100000) {
      return numberFormater.format(num);
    } else {
      return numberFormaterNoCompact.format(num);
    }
  },
};

export const getRandomNumberFrom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const formatAddress = (account: string) => {
  const address = account;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatWrapedText = (
  label: string,
  startChar: number = 4,
  endChar: number = 6
) => {
  if (label?.length >= startChar + endChar) {
    return `${label.slice(0, startChar)}...${label.slice(-endChar)}`;
  }
  return `${label}`;
};

export const gaEvent = ({ action, category, label, value }: any) => {
  try {
    // @ts-ignore
    (window as any)?.gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    });
  } catch (error) {
    console.log(`GA Error`, error);
  }
};

export function getColorForIndex(index: number, totalColors: number) {
  if (index === 0) {
    return "#00AAFF";
  }
  // Use a golden ratio conjugate to get more distinguishable colors
  const goldenRatioConjugate = 0.618033; // More precise value
  let hue = index / totalColors + goldenRatioConjugate;
  hue = hue % 1; // Keep the hue within 0-1 range

  // Vary saturation and lightness to ensure distinguishable colors
  const saturation = 60 + (index % 40); // Between 60% and 100%
  const lightness = 50 + ((index * 7) % 25); // Between 50% and 70%

  // Convert HSL to RGB
  const rgb = hslToRgb(hue * 360, saturation, lightness);

  // Convert RGB to HEX
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s; // Chroma
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r, g, b;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  // Convert to RGB and adjust by m
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  const toHex = (x: number) => {
    const hex = x.toString(16).padStart(2, "0");
    return hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function convertBytes(bytes: number) {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;
  const tb = gb / 1024;
  return {
    bytes: bytes.toFixed(2),
    kb: kb.toFixed(2),
    mb: mb.toFixed(2),
    gb: gb.toFixed(2),
    tb: tb.toFixed(2),
  };
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatEthereumValue(wei: number) {
  const WEI_IN_GWEI = 1_000_000_000;
  const WEI_IN_ETHER = 1_000_000_000_000_000_000;

  const ether = wei / WEI_IN_ETHER;
  const gwei = wei / WEI_IN_GWEI;
  const significance = 10000; // show ETH till 0.0001
  if (wei * significance >= WEI_IN_ETHER) {
    return `${ether.toFixed(4)} ETH`;
  } else if (wei >= WEI_IN_GWEI) {
    return `${gwei.toFixed(4)} GWEI`;
  } else {
    return `${wei} WEI`;
  }
}

interface Account {
  id: string;
  totalBlobTransactionCount: string;
  totalBlobGas: string;
  lastUpdatedBlock: string;
  totalBlobGasEth: string;
  totalBlobHashesCount: string;
  totalFeeEth: string;
  totalBlobBlocks?: string;
  __typename: string;
}

interface OtherAccount {
  totalBlobTransactionCount: number;
  totalBlobGas: number;
  totalBlobGasEth: string;
  totalBlobHashesCount: number;
  totalFeeEth: string;
  totalBlobBlocks?: string;
  totalBlobGasUSD?: string;
}

interface Result {
  topAccounts: Account[];
  other: OtherAccount;
}

export function processAccounts(data: Account[]): Account[] {
  // Sort the accounts by totalBlobGas in descending order using lodash
  const sortedAccounts = _.orderBy(
    data,
    [(account: any) => BigInt(account.totalBlobGas)],
    ["desc"]
  );

  // Get the top 5 accounts
  const topAccounts = _.slice(sortedAccounts, 0, 6);

  // Initialize the "Other" category
  const other: OtherAccount = {
    totalBlobTransactionCount: 0,
    totalBlobGas: 0,
    totalBlobGasEth: "0",
    totalBlobHashesCount: 0,
    totalFeeEth: "0",
    totalBlobBlocks: "0",
    totalBlobGasUSD: "0",
  };

  // Sum the remaining accounts into the "Other" category using lodash
  const otherAccounts = _.slice(sortedAccounts, 6);
  _.forEach(otherAccounts, (account: any) => {
    other.totalBlobTransactionCount += parseInt(
      account.totalBlobTransactionCount
    );
    other.totalBlobGas += parseInt(account.totalBlobGas);
    other.totalBlobGasEth = (
      BigInt(other.totalBlobGasEth) + BigInt(account.totalBlobGasEth)
    ).toString();
    other.totalBlobHashesCount += parseInt(account.totalBlobHashesCount);
    other.totalFeeEth = (
      BigInt(other.totalFeeEth) + BigInt(account.totalFeeEth)
    ).toString();
    if (account?.totalBlobBlocks && other?.totalBlobBlocks) {
      other.totalBlobBlocks = (
        BigInt(other?.totalBlobBlocks) + BigInt(account?.totalBlobBlocks)
      ).toString();
    }
    if (account?.totalBlobGasUSD && other?.totalBlobGasUSD) {
      other.totalBlobGasUSD = (
        Number(account?.totalBlobGasUSD) + Number(other?.totalBlobGasUSD)
      )?.toString();
    }
  });

  return [...topAccounts, other];
  // return { topAccounts, other };
}

export function getRandomNumber(num1: number, num2: number): number {
  const min = Math.min(num1, num2);
  const max = Math.max(num1, num2);

  return Math.random() * (max - min) + min;
}

export const dateTimeString = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
