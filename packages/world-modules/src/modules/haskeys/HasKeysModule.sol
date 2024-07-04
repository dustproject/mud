// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { BEFORE_SET_RECORD, AFTER_SPLICE_STATIC_DATA, AFTER_SPLICE_DYNAMIC_DATA, BEFORE_DELETE_RECORD } from "@latticexyz/store/src/storeHookTypes.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { Module } from "@latticexyz/world/src/Module.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { InstalledModules } from "@latticexyz/world/src/codegen/index.sol";

import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { HasKeysHook } from "./HasKeysHook.sol";
import { HasKeys } from "./tables/HasKeys.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that are in a given table.
 * This mapping is stored in a global table that is registered when the module is first installed.
 *
 * Note: this module currently only supports `installRoot` (via `World.installRootModule`).
 * TODO: add support for `install` (via `World.installModule`) by using `callFrom` with the `msgSender()`
 */
contract HasKeysModule is Module {
  using WorldResourceIdInstance for ResourceId;

  // The HasKeysHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  HasKeysHook private immutable hook = new HasKeysHook();

  function installRoot(bytes memory encodedArgs) public override {
    // Naive check to ensure this is only installed once
    // TODO: only revert if there's nothing to do
    requireNotInstalled(__self, encodedArgs);

    // Extract source table id from args
    ResourceId sourceTableId = ResourceId.wrap(abi.decode(encodedArgs, (bytes32)));

    IBaseWorld world = IBaseWorld(_world());

    // Initialize variable to reuse in low level calls
    bool success;
    bytes memory returnData;

    if (!ResourceIds._getExists(HasKeys._tableId)) {
      // Register the tables
      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(
          world.registerTable,
          (
            HasKeys._tableId,
            HasKeys._fieldLayout,
            HasKeys._keySchema,
            HasKeys._valueSchema,
            HasKeys.getKeyNames(),
            HasKeys.getFieldNames()
          )
        )
      );
      if (!success) revertWithBytes(returnData);

      // Grant the hook access to the tables
      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(world.grantAccess, (HasKeys._tableId, address(hook)))
      );
      if (!success) revertWithBytes(returnData);
    }

    // Register a hook that is called when a value is set in the source table
    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerStoreHook,
        (
          sourceTableId,
          hook,
          BEFORE_SET_RECORD | AFTER_SPLICE_STATIC_DATA | AFTER_SPLICE_DYNAMIC_DATA | BEFORE_DELETE_RECORD
        )
      )
    );
  }

  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }
}
