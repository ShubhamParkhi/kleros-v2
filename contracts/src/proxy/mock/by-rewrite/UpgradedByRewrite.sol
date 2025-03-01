//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/proxy/UUPSUpgradeableMock.sol>

pragma solidity 0.8.24;

import "../../UUPSProxiable.sol";
import "../../Initializable.sol";
import "../../UUPSProxy.sol";

contract UpgradedByRewriteProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract UpgradedByRewrite is UUPSProxiable, Initializable {
    //------------------------
    // V1 State
    //------------------------
    address public governor;
    uint256 public counter;
    uint256[50] __gap;

    constructor() {
        _disableInitializers();
    }

    function initialize(address _governor) external virtual reinitializer(1) {
        governor = _governor;
        counter = 1;
    }

    function _authorizeUpgrade(address) internal view override {
        require(governor == msg.sender, "No privilege to upgrade");
    }

    function increment() external {
        ++counter;
    }

    function version() external pure virtual returns (string memory) {
        return "V1";
    }
}
