import { useQuery } from "@tanstack/react-query";
import { getKlerosCoreUniversity } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const useAppealCost = (disputeID?: string) => {
  const klerosCore = getKlerosCoreUniversity({});
  const isEnabled = !isUndefined(klerosCore) && !isUndefined(disputeID);
  return useQuery({
    queryKey: [`AppealCost${disputeID}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (!klerosCore || typeof disputeID === "undefined") return;
      return await klerosCore.read.appealCost([BigInt(disputeID)]);
    },
  });
};
