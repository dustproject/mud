// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorldErrors } from "../../IWorldErrors.sol";

import { ExtendedWorldRegistrationSystem } from "./implementations/ExtendedWorldRegistrationSystem.sol";

/**
 * @title Extended Registration System for World
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This system aggregates World registration and installation functionalities externalized from the World contract, aiming to keep the World contract's bytecode lean.
 * @dev Aggregates multiple system implementations for the World.
 */
contract ExtendedRegistrationSystem is ExtendedWorldRegistrationSystem {
  // Currently, no additional functionality is added in this aggregate contract.
}
