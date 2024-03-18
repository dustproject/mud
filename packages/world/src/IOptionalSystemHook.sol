// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ISystemHook } from "./ISystemHook.sol";

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
   */
  function onRegisterHook() external;

  /**
   * @notice Executes when a system hook is unregistered by the user.
   * @dev Provides the ability to add custom logic or checks when a system hook is unregistered.
   */
  function onUnregisterHook() external;
}
