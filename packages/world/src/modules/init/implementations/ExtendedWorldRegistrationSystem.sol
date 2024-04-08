// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Hook, HookLib } from "@latticexyz/store/src/Hook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { System } from "../../../System.sol";
import { WorldContextConsumer, IWorldContextConsumer } from "../../../WorldContext.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "../../../WorldResourceId.sol";
import { SystemCall } from "../../../SystemCall.sol";
import { ROOT_NAMESPACE_ID, ROOT_NAME } from "../../../constants.sol";
import { RESOURCE_NAMESPACE, RESOURCE_SYSTEM } from "../../../worldResourceTypes.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { Delegation } from "../../../Delegation.sol";
import { requireInterface } from "../../../requireInterface.sol";
import { NamespaceOwner } from "../../../codegen/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../../codegen/tables/ResourceAccess.sol";
import { UserDelegationControl } from "../../../codegen/tables/UserDelegationControl.sol";
import { NamespaceDelegationControl } from "../../../codegen/tables/NamespaceDelegationControl.sol";
import { IOptionalSystemHook } from "../../../IOptionalSystemHook.sol";
import { IWorldErrors } from "../../../IWorldErrors.sol";
import { IDelegationControl } from "../../../IDelegationControl.sol";
import { ICustomUnregisterDelegation } from "../../../ICustomUnregisterDelegation.sol";
import { ERC165Checker } from "../../../ERC165Checker.sol";

import { SystemHooks } from "../../../codegen/tables/SystemHooks.sol";
import { OptionalSystemHooks } from "../../../codegen/tables/OptionalSystemHooks.sol";
import { SystemRegistry } from "../../../codegen/tables/SystemRegistry.sol";
import { Systems } from "../../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../../codegen/tables/FunctionSelectors.sol";
import { FunctionSignatures } from "../../../codegen/tables/FunctionSignatures.sol";
import { requireNamespace } from "../../../requireNamespace.sol";
import { requireValidNamespace } from "../../../requireValidNamespace.sol";

import { LimitedCallContext } from "../LimitedCallContext.sol";

/**
 * @title ExtendedWorldRegistrationSystem
 * @dev This contract provides extended functions related to registering resources other than tables in the World.
 */
contract ExtendedWorldRegistrationSystem is System, IWorldErrors, LimitedCallContext {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @notice Registers a new optional system hook for the user
   * @dev Adds a new hook for the system at the provided user, system, and call data hash (optional)
   * @param systemId The ID of the system
   * @param hookAddress The address of the hook being registered
   * @param enabledHooksBitmap Bitmap indicating which hooks are enabled
   * @param callDataHash The hash of the call data for the system hook
   */
  function registerOptionalSystemHook(
    ResourceId systemId,
    IOptionalSystemHook hookAddress,
    uint8 enabledHooksBitmap,
    bytes32 callDataHash
  ) public onlyDelegatecall {
    // Require the provided system ID to have type RESOURCE_SYSTEM
    if (systemId.getType() != RESOURCE_SYSTEM) {
      revert World_InvalidResourceType(RESOURCE_SYSTEM, systemId, systemId.toString());
    }

    // Require the provided address to implement the IOptionalSystemHook interface
    requireInterface(address(hookAddress), type(IOptionalSystemHook).interfaceId);

    // Require the system to exist
    AccessControl.requireExistence(systemId);

    // Require the system's namespace to exist
    AccessControl.requireExistence(systemId.getNamespaceId());

    bytes21[] memory currentHooks = OptionalSystemHooks._get(_msgSender(), systemId, callDataHash);
    for (uint256 i = 0; i < currentHooks.length; i++) {
      if (Hook.wrap(currentHooks[i]).getAddress() == address(hookAddress)) {
        revert World_OptionalHookAlreadyRegistered(systemId, address(hookAddress), callDataHash);
      }
    }

    IOptionalSystemHook(address(hookAddress)).onRegisterHook(_msgSender(), systemId, enabledHooksBitmap, callDataHash);

    // Register the hook
    OptionalSystemHooks.push(
      _msgSender(),
      systemId,
      callDataHash,
      Hook.unwrap(HookLib.encode(address(hookAddress), enabledHooksBitmap))
    );
  }

  /**
   * @notice Unregisters an optional system hook
   * @dev Removes a hook for the system at the provided user, system, and call data hash (optional)
   * @param systemId The ID of the system
   * @param hookAddress The address of the hook being unregistered
   * @param callDataHash The hash of the call data for the system hook
   */
  function unregisterOptionalSystemHook(
    ResourceId systemId,
    IOptionalSystemHook hookAddress,
    bytes32 callDataHash
  ) public virtual onlyDelegatecall {
    // Remove the hook from the list of hooks for this system in the optional system hooks table
    bytes21[] memory currentHooks = OptionalSystemHooks._get(_msgSender(), systemId, callDataHash);

    // Initialize the new hooks array with the same length because we don't know if the hook is registered yet
    bytes21[] memory newHooks = new bytes21[](currentHooks.length);

    // Filter the array of current hooks
    uint256 newHooksIndex;
    unchecked {
      for (uint256 currentHooksIndex; currentHooksIndex < currentHooks.length; currentHooksIndex++) {
        Hook hook = Hook.wrap(currentHooks[currentHooksIndex]);
        if (hook.getAddress() != address(hookAddress)) {
          newHooks[newHooksIndex] = currentHooks[currentHooksIndex];
          newHooksIndex++;
        } else {
          address(hookAddress).call(
            abi.encodeCall(
              IOptionalSystemHook.onUnregisterHook,
              (_msgSender(), systemId, hook.getBitmap(), callDataHash)
            )
          );
        }
      }
    }

    // Set the new hooks table length in place
    // (Note: this does not update the free memory pointer)
    assembly {
      mstore(newHooks, newHooksIndex)
    }

    // Set the new hooks table
    OptionalSystemHooks._set(_msgSender(), systemId, callDataHash, newHooks);
  }
}
