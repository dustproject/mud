// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { HasKeys } from "./tables/HasKeys.sol";

/**
 * Note: if a table with composite keys is used, only the first five keys of the tuple are indexed
 */
contract HasKeysHook is StoreHook {
  function handleSet(ResourceId tableId, bytes32[] memory keyTuple) internal {
    bytes32 keysHash = keccak256(abi.encode(keyTuple));

    // If the key has not yet been set in the table...
    if (!HasKeys.get(tableId, keysHash)) {
      HasKeys.set(tableId, keysHash, true);
    }
  }

  function onBeforeSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory,
    PackedCounter,
    bytes memory,
    FieldLayout
  ) public override {
    handleSet(tableId, keyTuple);
  }

  function onAfterSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48,
    bytes memory
  ) public override {
    handleSet(tableId, keyTuple);
  }

  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8,
    uint40,
    uint40,
    PackedCounter,
    bytes memory
  ) public override {
    handleSet(tableId, keyTuple);
  }

  function onBeforeDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout) public override {
    bytes32 keysHash = keccak256(abi.encode(keyTuple));

    if (HasKeys.get(tableId, keysHash)) {
      HasKeys.deleteRecord(tableId, keysHash);
    }
  }
}
