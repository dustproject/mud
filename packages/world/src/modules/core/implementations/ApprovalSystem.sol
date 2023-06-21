// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { Call } from "../../../Call.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../../tables/InstalledModules.sol";
import { Approval, ApprovalData } from "../../../tables/Approval.sol";

/**
 * Allows Alice to grant Bob permission to call a resource (see `callFrom` in World)
 * The proposal for this system is outlined here: https://github.com/latticexyz/mud/issues/327
 */

contract ApprovalSystem is System {
  uint256 constant MAX_UINT128 = (2 ** 128) - 1;

  /**
   * Creates a new approval from msg.sender as grantor to grantee. To create a generic approval, systemID can be set to 0.
   */
  function setApproval(address grantor, address grantee, uint256 systemID, ApprovalData memory approval) private {
    bytes32 approvalSelector = getApprovalSelector(grantor, grantee, systemID);
    Approval.set(approvalSelector, approval);
  }

  //
  //  function getFunctionSelector(string memory _func) private pure returns (bytes4) {
  //    return bytes4(keccak256(bytes(_func)));
  //  }

  /**
   * Creates a new approval from msg.sender as grantor to grantee (for all systems)
   */
  function setApproval(
    address grantee,
    uint128 expiryTimestamp,
    uint128 numCalls,
    bytes4 funcSelector,
    bytes memory args
  ) public {
    bytes memory funcSelectorAndArgs = abi.encodeWithSelector(funcSelector, args);
    ApprovalData memory approval = ApprovalData(expiryTimestamp, numCalls, funcSelectorAndArgs);

    // setting systemID to 0 means the grantee has approval for all systems
    setApproval(msg.sender, grantee, 0, approval);
  }

  /**
   * Revoke approvals to the grantee for a system
   */
  function revokeApproval(address grantee, uint256 systemID) public {
    // Require the caller to own the namespace
    bytes32 approvalSelector = getApprovalSelector(msg.sender, grantee, systemID);

    // Revoke approval
    Approval.deleteRecord(approvalSelector);
  }

  /**
   * Revoke approvals to the grantee for all systems
   * If the grantee was given approval for an individual system, they will STILL have approval for that system.
   */
  function revokeApproval(address grantee) public {
    // setting systemID to 0 means removing approvals for the grantee for all systems
    revokeApproval(grantee, 0);
  }

  /**
   * Reduces the number of calls left in an approval by 1
   */
  function reduceApproval(address grantor, address grantee, bytes memory funcSelectorAndArgs) public {
    // setting systemID to 0 means reducing approvals for the grantee for all systems
    reduceApproval(grantor, grantee, 0, funcSelectorAndArgs);
  }

  /**
   * Reduces the number of calls left in an approval by 1
   */
  function reduceApproval(address grantor, address grantee, uint256 systemID, bytes memory funcSelectorAndArgs) public {
    // 1) Check for a generic approval
    ApprovalData memory approval = Approval.get(getApprovalSelector(grantor, grantee, 0));

    // This is a hack to determine if the approval is found since STORE doesn't provide a has() function
    bool isApprovalFound = approval.funcSelectorAndArgs.length > 0 &&
      approval.expiryTimestamp > 0 &&
      approval.numCalls > 0;
    // Return successfully if a valid generic approval is found
    if (isApprovalFound && approval.expiryTimestamp > block.timestamp) return;

    // 2) No generic approval found, check for a specific approval
    approval = Approval.get(getApprovalSelector(grantor, grantee, systemID));
    isApprovalFound = approval.funcSelectorAndArgs.length > 0 && approval.expiryTimestamp > 0 && approval.numCalls > 0;

    // Throw if no approval is found
    require(isApprovalFound, "no approval");

    // Throw if expiry timestamp is in the past
    require(approval.expiryTimestamp > block.timestamp, "approval expired");

    // Throw if numCalls is 0
    require(approval.numCalls > 0, "no approved calls left");

    // Throw if funcSelectorAndArgs exists and doesn't match approved funcSelectorAndArgs
    require(
      approval.funcSelectorAndArgs.length == 0 ||
        keccak256(approval.funcSelectorAndArgs) == keccak256(funcSelectorAndArgs),
      "funcSelectorAndArgs not approved"
    );

    // Reduce numCalls, unless it's MAX_UINT128 to support permanent approvals
    if (approval.numCalls != MAX_UINT128) {
      approval.numCalls--;
      setApproval(grantor, grantee, systemID, approval);
    }
  }

  function getApprovalSelector(address grantor, address grantee, uint256 systemID) private pure returns (bytes32) {
    return keccak256(abi.encode(grantor, grantee, systemID));
  }
}
