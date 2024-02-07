import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber, BigNumberish } from "ethers";
import { getContractAddress } from "./utils/getContractAddress";
import { deployUpgradable } from "./utils/deployUpgradable";
import { HomeChains, isSkipped } from "./utils";
import { deployERC20AndFaucet } from "./utils/deployERC20AndFaucet";
import { DisputeKitClassic, KlerosCore, KlerosCoreUniversity } from "../typechain-types";
import { getContractOrDeployUpgradable } from "./utils/getContractOrDeploy";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  const { AddressZero } = hre.ethers.constants;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const pnk = await deployERC20AndFaucet(hre, deployer, "PNK");
  const dai = await deployERC20AndFaucet(hre, deployer, "DAI");
  const weth = await deployERC20AndFaucet(hre, deployer, "WETH");

  const disputeKit = await deployUpgradable(deployments, "DisputeKitClassicUniversity", {
    from: deployer,
    contract: "DisputeKitClassic",
    args: [deployer, AddressZero],
    log: true,
  });

  let klerosCoreAddress = await deployments.getOrNull("KlerosCoreUniversity").then((deployment) => deployment?.address);
  if (!klerosCoreAddress) {
    const nonce = await ethers.provider.getTransactionCount(deployer);
    klerosCoreAddress = getContractAddress(deployer, nonce + 3); // deployed on the 4th tx (nonce+3): SortitionModule Impl tx, SortitionModule Proxy tx, KlerosCore Impl tx, KlerosCore Proxy tx
    console.log("calculated future KlerosCoreUniversity address for nonce %d: %s", nonce + 3, klerosCoreAddress);
  }
  const sortitionModule = await deployUpgradable(deployments, "SortitionModuleUniversity", {
    from: deployer,
    args: [deployer, klerosCoreAddress],
    log: true,
  }); // nonce (implementation), nonce+1 (proxy)

  const minStake = BigNumber.from(10).pow(20).mul(2);
  const alpha = 10000;
  const feeForJuror = BigNumber.from(10).pow(17);
  const klerosCore = await deployUpgradable(deployments, "KlerosCoreUniversity", {
    from: deployer,
    args: [
      deployer, // governor
      deployer, // instructor
      pnk.address,
      AddressZero,
      disputeKit.address,
      false,
      [minStake, alpha, feeForJuror, 256], // minStake, alpha, feeForJuror, jurorsForCourtJump
      [0, 0, 0, 10], // evidencePeriod, commitPeriod, votePeriod, appealPeriod
      sortitionModule.address,
    ],
    log: true,
  }); // nonce+2 (implementation), nonce+3 (proxy)

  // changeCore() only if necessary
  const currentCore = (await ethers.getContract("KlerosCoreUniversity")) as KlerosCoreUniversity;
  if (currentCore.address !== klerosCore.address) {
    await ethers
      .getContract("DisputeKitClassicUniversity")
      .then((disputeKit) => (disputeKit as DisputeKitClassic).changeCore(klerosCore.address));
  }

  const changeCurrencyRate = async (
    erc20: string,
    accepted: boolean,
    rateInEth: BigNumberish,
    rateDecimals: BigNumberish
  ) => {
    const core = (await ethers.getContract("KlerosCoreUniversity")) as KlerosCore;
    const pnkRate = await core.currencyRates(erc20);
    if (pnkRate.feePaymentAccepted !== accepted) {
      console.log(`core.changeAcceptedFeeTokens(${erc20}, ${accepted})`);
      await core.changeAcceptedFeeTokens(erc20, accepted);
    }
    if (!pnkRate.rateInEth.eq(rateInEth) || pnkRate.rateDecimals !== rateDecimals) {
      console.log(`core.changeCurrencyRates(${erc20}, ${rateInEth}, ${rateDecimals})`);
      await core.changeCurrencyRates(erc20, rateInEth, rateDecimals);
    }
  };

  try {
    await changeCurrencyRate(pnk.address, true, 12225583, 12);
    await changeCurrencyRate(dai.address, true, 60327783, 11);
    await changeCurrencyRate(weth.address, true, 1, 1);
  } catch (e) {
    console.error("failed to change currency rates:", e);
  }

  const disputeTemplateRegistry = await getContractOrDeployUpgradable(hre, "DisputeTemplateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  await deploy("DisputeResolverUniversity", {
    from: deployer,
    contract: "DisputeResolver",
    args: [klerosCore.address, disputeTemplateRegistry.address],
    log: true,
  });
};

deployArbitration.tags = ["ArbitrationUniversity"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, !HomeChains[network.config.chainId ?? 0]);
};

export default deployArbitration;
