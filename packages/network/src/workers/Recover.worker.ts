import { Message } from "@latticexyz/services/ecs-relay";
import { expose } from "threads/worker";
import { verifyMessage } from "ethers/lib/utils.js";
import { messagePayload } from "../utils";

export function recoverAddress(msg: Message) {
  return verifyMessage(messagePayload(msg), msg.signature);
}

// expose({ recoverAddress });
