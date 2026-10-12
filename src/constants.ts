import "dotenv/config";
import { providers } from "ethers";
import { SUPPORTED_CHAINS, CHAIN_ID, chainInfo } from "@trustvc/trustvc";

const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TRUSTED_APEX_HOST = "trustvc.io";

const isDnsHostname = (hostname: string): boolean =>
  hostname.split(".").every((label) => DNS_LABEL.test(label));

const isHostOrSubdomain = (hostname: string, apex: string): boolean =>
  hostname === apex ||
  (hostname.endsWith(`.${apex}`) && isDnsHostname(hostname));

// Shared by credentialed CORS and the Origin/Referer guard.
// The host must be the apex or a dot-separated subdomain, and the origin
// string must be exactly scheme + host. A trusted name glued to another
// domain (trustvc.io.evil.com, eviltrustvc.io) does not match.
export const isAllowedBrowserOrigin = (origin: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (parsed.username !== "" || parsed.password !== "") return false;
  if (parsed.port !== "") return false;
  if (parsed.origin !== origin) return false;
  return isHostOrSubdomain(parsed.hostname, TRUSTED_APEX_HOST);
};

export const LOCALHOST_ORIGINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
];

export enum ERROR_MESSAGE {
  CORS_UNALLOWED = "The CORS policy for this site does not allow access from the specified Origin.",
  API_KEY_INVALID = "API key invalid.",
  DOCUMENT_NOT_FOUND = "Document not found.",
  DOCUMENT_EXPIRED = "This document has been removed. Documents in the development environment are only retained for 30 days.",
  DOCUMENT_GENERIC_ERROR = "Document invalid.",
  DOCUMENT_SCHEMA_INVALID = "Document is not OA compliant.",
  DOCUMENT_NETWORK_NOT_FOUND = "Document network not found.",
  NETWORK_UNSUPPORTED = "Network is unsupported.",
  DOCUMENT_ALREADY_EXISTS = "A document is already stored for this identifier.",
  RESERVATION_REQUIRED = "Writes are accepted only for an unused reservation.",
  RESERVATION_PROOF_INVALID = "Reservation key is missing or invalid.",
}

export enum DOCUMENT_STORAGE_ERROR_MESSAGE {
  KEY_NOT_EXISTS = "The specified key does not exist.",
}

export const MAX_REQUEST_BODY_SIZE = "6mb";

const infuraProvider =
  (networkName: string): (() => providers.Provider) =>
  () =>
    new providers.InfuraProvider(networkName);

const jsonRpcProvider =
  (url: string): (() => providers.Provider) =>
  () =>
    new providers.JsonRpcProvider(url);

type supportedNetworks = Record<
  CHAIN_ID,
  chainInfo & { provider: () => providers.Provider }
>;

export const SUPPORTED_NETWORKS: supportedNetworks = {
  [CHAIN_ID.local]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.local],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.local].rpcUrl),
  },
  [CHAIN_ID.mainnet]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.mainnet],
    provider: infuraProvider("homestead"),
  },
  [CHAIN_ID.matic]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.matic],
    provider: infuraProvider("matic"),
  },
  [CHAIN_ID.amoy]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.amoy],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.amoy].rpcUrl),
  },
  [CHAIN_ID.sepolia]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.sepolia],
    provider: infuraProvider("sepolia"),
  },
  [CHAIN_ID.xdc]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.xdc],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.xdc].rpcUrl),
  },
  [CHAIN_ID.xdcapothem]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.xdcapothem],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.xdcapothem].rpcUrl),
  },
  [CHAIN_ID.stabilitytestnet]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.stabilitytestnet],
    rpcUrl: process.env.STABILITY_TESTNET_API_KEY
      ? `https://rpc.testnet.stabilityprotocol.com/zgt/${process.env.STABILITY_TESTNET_API_KEY}`
      : "https://free.testnet.stabilityprotocol.com",
    provider: jsonRpcProvider(
      process.env.STABILITY_TESTNET_API_KEY
        ? `https://rpc.testnet.stabilityprotocol.com/zgt/${process.env.STABILITY_TESTNET_API_KEY}`
        : "https://free.testnet.stabilityprotocol.com",
    ),
  },
  [CHAIN_ID.stability]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.stability],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.stability].rpcUrl),
  },
  [CHAIN_ID.astron]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.astron],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.astron].rpcUrl),
  },
  [CHAIN_ID.astrontestnet]: {
    ...SUPPORTED_CHAINS[CHAIN_ID.astrontestnet],
    provider: jsonRpcProvider(SUPPORTED_CHAINS[CHAIN_ID.astrontestnet].rpcUrl),
  },
};
