// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IERC165 } from "./IERC165.sol";

interface ICustomUnregisterDelegation is IERC165 {
  function canUnregister(address delegator) external returns (bool);
}
