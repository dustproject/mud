// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { HasKeys } from "./tables/HasKeys.sol";

/**
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract HasKeysHook is IStoreHook {
  function handleSet(bytes32 tableId, bytes32[] memory key) internal {
    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key has not yet been set in the table...
    if (!HasKeys.get(tableId, keysHash)) {
      HasKeys.set(tableId, keysHash, true);
    }
  }

  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory, Schema) public {
    handleSet(table, key);
  }

  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory, Schema) public {}

  function onAfterSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory, Schema) public {
    handleSet(table, key);
  }

  function onDeleteRecord(bytes32 tableId, bytes32[] memory key, Schema) public {
    bytes32 keysHash = keccak256(abi.encode(key));

    if (HasKeys.get(tableId, keysHash)) {
      HasKeys.deleteRecord(tableId, keysHash);
    }
  }
}
