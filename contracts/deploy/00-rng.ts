import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { SortitionModule } from "../typechain-types";
import { HomeChains, isMainnet, isSkipped } from "./utils";
import { deployUpgradable } from "./utils/deployUpgradable";
import { getContractOrDeploy } from "./utils/getContractOrDeploy";

const deployArbitration: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, getChainId, ethers } = hre;
  const { deploy } = deployments;
  const RNG_LOOKAHEAD = 20;

  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await hre.ethers.getSigners())[0].address;
  const chainId = Number(await getChainId());
  console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);

  const sortitionModule = (await ethers.getContract("SortitionModuleNeo")) as SortitionModule;

  const randomizerOracle = await getContractOrDeploy(hre, "RandomizerOracle", {
    from: deployer,
    contract: "RandomizerMock",
    args: [],
    log: true,
  });

  const rng1 = await deploy("RandomizerRNG", {
    from: deployer,
    args: [deployer, sortitionModule.target, randomizerOracle.address],
    log: true,
  });

  const rng2 = await deploy("BlockHashRNG", {
    from: deployer,
    args: [],
    log: true,
  });

  await sortitionModule.changeRandomNumberGenerator(rng2.address, RNG_LOOKAHEAD);
};

deployArbitration.tags = ["RNG"];
deployArbitration.skip = async ({ network }) => {
  return isSkipped(network, isMainnet(network));
};

export default deployArbitration;
