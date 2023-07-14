import { Components, SchemaOf, Override, Entity } from "@latticexyz/recs";
import { ValueOf } from "@latticexyz/utils";
import { ContractTransaction } from "ethers";

export type ComponentUpdate<C extends Components> = ValueOf<{
  [key in keyof C]: {
    component: key;
    entity: Entity;
    value: Override<SchemaOf<C[key]>>["value"];
  };
}>;

export type ActionRequest<C extends Components, T, M = undefined> = {
  // Identifier of this action. Will be used as entity id of the Action component.
  id: string;

  // Specify which entity this action is related to.
  on?: Entity;

  // Components this action depends on in requirement and updates
  components: C;

  // Action will be executed once requirement function returns a truthy value.
  // Requirement will be rechecked if any component value accessed in the requirement changes (including optimistic updates)
  requirement: (componentsWithOptimisticUpdates: C) => T | null;

  // Declare effects this action will have on components.
  // Used to compute component values with optimistic updates for other requested actions.
  updates: (componentsWithOptimisticUpdates: C, data: T) => ComponentUpdate<C>[];

  // Logic to be executed when the action is executed.
  // If txHashes are returned from the txQueue, the action will only be completed (and pending updates removed)
  // once all events from the given txHashes have been received and reduced.
  execute: (
    data: T
  ) =>
    | Promise<ContractTransaction>
    | Promise<void>
    | Promise<{ hash: string; wait(): Promise<unknown> }>
    | void
    | undefined;

  // Flag to set if the queue should wait for the underlying transaction to be confirmed (in addition to being reduced)
  awaitConfirmation?: boolean;

  // If the transaction does not write to a table, we use this flag to skip waiting for the transaction to be reduced
  // This is because transactions are only reduced if they write to a table. This flag allows non-write transactions to finish and leave the action queue
  txMayNotWriteToTable?: boolean;

  // Metadata
  metadata?: M;

  // Called when the action is successfully executed
  onSuccessCallback?(actionId: string, txHash: string): void;

  // Called when the action fails to execute
  onErrorCallback?(actionId: string, error: any): void;
};

export type ActionData<M = undefined> = ActionRequest<Components, unknown, M> & {
  componentsWithOptimisticUpdates: Components;
  entity: Entity;
};
