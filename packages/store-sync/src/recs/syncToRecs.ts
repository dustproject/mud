import { World as RecsWorld, getComponentValue, setComponent } from "@latticexyz/recs";
import { StoreConfig } from "@latticexyz/store";
import storeConfig from "@latticexyz/store/mud.config.js";
import worldConfig from "@latticexyz/world/mud.config.js";
import { SyncStep } from "../SyncStep";
import { SyncOptions, SyncResult } from "../common";
import { createStoreSync } from "../createStoreSync";
import { ConfigToRecsComponents } from "./common";
import { configToRecsComponents } from "./configToRecsComponents";
import { defineInternalComponents } from "./defineInternalComponents";
import { RecsUpdatesHook, recsStorage } from "./recsStorage";
import { singletonEntity } from "./singletonEntity";

type SyncToRecsOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  world: RecsWorld;
  config: TConfig;
  startSync?: boolean;
  recsAllUpdatesHook?: RecsUpdatesHook;
};

type SyncToRecsResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig> & {
  components: ConfigToRecsComponents<TConfig> &
    ConfigToRecsComponents<typeof storeConfig> &
    ConfigToRecsComponents<typeof worldConfig> &
    ReturnType<typeof defineInternalComponents>;
  stopSync: () => void;
};

export async function syncToRecs<TConfig extends StoreConfig = StoreConfig>({
  world,
  config,
  address,
  publicClient,
  startBlock,
  maxBlockRange,
  initialState,
  indexerUrl,
  recsAllUpdatesHook,
  startSync = true,
}: SyncToRecsOptions<TConfig>): Promise<SyncToRecsResult<TConfig>> {
  const components = {
    ...configToRecsComponents(world, config),
    ...configToRecsComponents(world, storeConfig),
    ...configToRecsComponents(world, worldConfig),
    ...defineInternalComponents(world),
  };

  world.registerEntity({ id: singletonEntity });

  const storeSync = await createStoreSync({
    storageAdapter: recsStorage({ components, config }, recsAllUpdatesHook),
    config,
    address,
    publicClient,
    startBlock,
    maxBlockRange,
    indexerUrl,
    initialState,
    onProgress: ({ step, percentage, latestBlockNumber, lastBlockNumberProcessed, message }) => {
      if (getComponentValue(components.SyncProgress, singletonEntity)?.step !== SyncStep.LIVE) {
        setComponent(components.SyncProgress, singletonEntity, {
          step,
          percentage,
          latestBlockNumber,
          lastBlockNumberProcessed,
          message,
        });
      }
    },
  });

  const sub = startSync ? storeSync.blockStorageOperations$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  world.registerDisposer(stopSync);

  return {
    ...storeSync,
    components,
    stopSync,
  };
}
