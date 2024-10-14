import { parseAbiItem } from "viem";
import { AbiCallMapping } from "src/dataMappings/utils/actionTypes";
import { createResultObject } from "src/dataMappings/utils/createResultObject";
import { getPublicClient } from "src/sdk";

export const callAction = async (mapping: AbiCallMapping) => {
  const publicClient = getPublicClient();

  const { abi: source, address, args, seek, populate } = mapping;
  const parsedAbi = typeof source === "string" ? parseAbiItem(source) : source;

  const data = await publicClient.readContract({
    address,
    abi: [parsedAbi],
    args,
  });

  return createResultObject(data, seek, populate);
};
