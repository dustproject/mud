// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceType } from "../core/tables/ResourceType.sol";
import { Resource } from "../../Types.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { HasKeysHook } from "./HasKeysHook.sol";
import { HasKeys, HasKeysTableId } from "./tables/HasKeys.sol";

contract HasKeysModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  // The HasKeysHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  HasKeysHook immutable hook = new HasKeysHook();

  function getName() public pure returns (bytes16) {
    return bytes16("hasKeys");
  }

  function install(bytes memory args) public override {
    // Extract source table id from args
    bytes32 sourceTableId = abi.decode(args, (bytes32));

    IBaseWorld world = IBaseWorld(_world());

    if (ResourceType.get(HasKeysTableId) == Resource.NONE) {
      // Register the tables
      HasKeys.register(world);

      // Grant the hook access to the tables
      world.grantAccess(HasKeysTableId, address(hook));
    }

    // Register a hook that is called when a value is set in the source table
    world.registerStoreHook(sourceTableId, hook);
  }
}
