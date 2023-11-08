import { tableIdToHex } from "@latticexyz/common";
import { isDefined } from "@latticexyz/common/utils";
import {
  ComponentUpdate,
  ComponentValue,
  Entity,
  Component as RecsComponent,
  Schema as RecsSchema,
  getComponentValue,
  removeComponent,
  setComponent,
  updateComponent,
} from "@latticexyz/recs";
import { StoreConfig } from "@latticexyz/store";
import { BlockLogsToStorageOptions } from "../blockLogsToStorage";
import { BlockLogs } from "../common";
import { schemaToDefaults } from "../schemaToDefaults";
import { StoreComponentMetadata } from "./common";
import { debug } from "./debug";
import { defineInternalComponents } from "./defineInternalComponents";
import { encodeEntity } from "./encodeEntity";
import { getTableEntity } from "./getTableEntity";

export type ComponentEntityUpdates = Map<string, Map<Entity, ComponentUpdate[]>>;

export type RecsUpdatesHook = (
  blockNumber: BlockLogs["blockNumber"],
  componentEntityUpdates: ComponentEntityUpdates
) => Promise<void>;

export function recsStorage<TConfig extends StoreConfig = StoreConfig>(
  {
    components,
    address,
  }: {
    components: ReturnType<typeof defineInternalComponents> &
      Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>>;
    config?: TConfig;
    address: `0x${string}` | undefined;
  },
  recsAllUpdatesHook?: RecsUpdatesHook
): BlockLogsToStorageOptions<TConfig> {
  // TODO: do we need to store block number?

  const componentsByTableId = Object.fromEntries(
    Object.entries(components).map(([id, component]) => [component.id, component])
  );

  return {
    async registerTables({ tables }) {
      for (const table of tables) {
        // TODO: check if table exists already and skip/warn?
        setComponent(components.RegisteredTables, getTableEntity(table), { table });
      }
    },
    async getTables({ tables }) {
      // TODO: fetch schema from RPC if table not found?
      return tables
        .map((table) => getComponentValue(components.RegisteredTables, getTableEntity(table))?.table)
        .filter(isDefined);
    },
    async storeOperations({ blockNumber, operations }) {
      const componentEntityUpdates: ComponentEntityUpdates = new Map<string, Map<Entity, ComponentUpdate[]>>();
      for (const operation of operations) {
        const table = getComponentValue(
          components.RegisteredTables,
          getTableEntity({
            address: operation.address,
            namespace: operation.namespace,
            name: operation.name,
          })
        )?.table;
        if (!table) {
          debug(`skipping update for unknown table: ${operation.namespace}:${operation.name} at ${operation.address}`);
          continue;
        }

        const tableId = tableIdToHex(operation.namespace, operation.name);
        const component = componentsByTableId[tableId];
        if (!component) {
          debug(`skipping update for unknown component: ${tableId}. Available components: ${Object.keys(components)}`);
          continue;
        }

        const entity = encodeEntity(table.keySchema, operation.key);

        let newUpdate = undefined;
        if (operation.type === "SetRecord") {
          debug("setting component", tableId, entity, operation.value);
          newUpdate = setComponent(component, entity, operation.value as ComponentValue);
        } else if (operation.type === "SetField") {
          debug("updating component", tableId, entity, {
            [operation.fieldName]: operation.fieldValue,
          });
          newUpdate = updateComponent(
            component,
            entity,
            { [operation.fieldName]: operation.fieldValue } as ComponentValue,
            schemaToDefaults(table.valueSchema) as ComponentValue
          );
        } else if (operation.type === "DeleteRecord") {
          debug("deleting component", tableId, entity);
          newUpdate = removeComponent(component, entity);
        }

        if (newUpdate) {
          if (componentEntityUpdates.has(newUpdate.component.id)) {
            if (componentEntityUpdates.get(newUpdate.component.id)?.has(newUpdate.entity)) {
              componentEntityUpdates.get(newUpdate.component.id)?.get(newUpdate.entity)?.push(newUpdate);
            } else {
              componentEntityUpdates.get(newUpdate.component.id)?.set(newUpdate.entity, [newUpdate]);
            }
          } else {
            const entityUpdates = new Map<Entity, ComponentUpdate[]>();
            entityUpdates.set(newUpdate.entity, [newUpdate]);
            componentEntityUpdates.set(newUpdate.component.id, entityUpdates);
          }
        }
      }

      if (recsAllUpdatesHook !== undefined) {
        await recsAllUpdatesHook(blockNumber, componentEntityUpdates);
      }
    },
  } as BlockLogsToStorageOptions<TConfig>;
}
