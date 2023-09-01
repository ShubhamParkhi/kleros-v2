import { Abi, PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import { GetContractArgs, GetContractResult } from "wagmi/actions";
import { getPinakionV2, pinakionV2ABI, getWeth, getPnkFaucet, wethABI, pnkFaucetABI } from "./contracts/generated";

type Config = Omit<GetContractArgs<Abi, unknown>, "abi" | "address"> & {
  chainId?: any;
};

export const useContractAddress = <TAbi extends Abi>(
  getter: (c: Config) => GetContractResult<TAbi, PublicClient>
): GetContractResult<TAbi, PublicClient> => {
  const publicClient = usePublicClient();
  return getter({ walletClient: publicClient });
};

export const usePNKAddress = () => {
  return `ethereum:${useContractAddress<typeof pinakionV2ABI>(getPinakionV2)?.address}`;
};

export const useWETHAddress = () => {
  return `ethereum:${useContractAddress<typeof wethABI>(getWeth)?.address}`;
};

export const usePNKFaucetAddress = () => {
  return useContractAddress<typeof pnkFaucetABI>(getPnkFaucet)?.address;
};

export const useWETHMainnetAddress = () => {
  return "ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
};

export const usePNKMainnetAddress = () => {
  return "ethereum:0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d";
};
