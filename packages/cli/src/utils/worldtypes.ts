import { getOutDirectory } from "@latticexyz/common/foundry";
import path from "path";
import { runTypeChain } from "typechain";
import fs from "fs";

/**
 * Generate IWorld typescript bindings
 */
export async function worldtypes() {
  const cwd = process.cwd();
  const forgeOurDir = await getOutDirectory();

  // Curtis changed this IWorldPath after we migrated to Yarn since we had a naming conflict (two IWorld.sol files): https://github.com/tenetxyz/voxel-aw/pull/45/files
  // const IWorldPath = path.join(process.cwd(), forgeOurDir, "IWorld.sol/IWorld.json");
  let IWorldPath = path.join(process.cwd(), forgeOurDir, "IWorld.sol/IWorld.json");

  const IWorldDirPath = path.join(process.cwd(), forgeOurDir, "world"); // if the world directory exists, the IWorld.sol files are in here instead
  if (fs.existsSync(IWorldDirPath)) {
    IWorldPath = path.join(process.cwd(), forgeOurDir, "world/IWorld.sol/IWorld.json");
  }

  await runTypeChain({
    cwd,
    filesToProcess: [IWorldPath],
    allFiles: [IWorldPath],
    target: "ethers-v5",
  });

  console.log("Typechain generated IWorld interface");
}
