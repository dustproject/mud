// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ISystemHook } from "./ISystemHook.sol";
import { Hook } from "@latticexyz/store/src/Hook.sol";

/**
 * @title IOptionalSystemHook
 * @dev Interface defining optional hooks for external functionality.
 * Provides pre and post hooks that can be triggered before and after a system call respectively.
 * This interface adheres to the ERC-165 standard for determining interface support.
 */
interface IOptionalSystemHook is ISystemHook {
  /**
   * @notice Executes when a system hook is registered by the user.
   * @dev Provides the ability to add custom logic or checks when a system hook is registered.
   * @param msgSender The original sender of the system call.
   * @param systemId The ID of the system
   * @param enabledHooksBitmap Bitmap indicating which hooks are enabled
   * @param callDataHash The hash of the call data for the system hook
   */
  function onRegisterHook(
    address msgSender,
    ResourceId systemId,
    uint8 enabledHooksBitmap,
    bytes32 callDataHash
  ) external;

  /**
   * @notice Executes when a system hook is unregistered by the user.
   * @dev Provides the ability to add custom logic or checks when a system hook is unregistered.
   * @param msgSender The original sender of the system call.
   * @param systemId The ID of the system
   * @param enabledHooksBitmap Bitmap indicating which hooks are enabled
   * @param callDataHash The hash of the call data for the system hook
   */
  function onUnregisterHook(
    address msgSender,
    ResourceId systemId,
    uint8 enabledHooksBitmap,
    bytes32 callDataHash
  ) external;
}
