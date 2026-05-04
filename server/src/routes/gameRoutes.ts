import type { ServerWebSocket } from "bun";

import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import {
  handleClose,
  handleMessage,
  handleOpen,
} from "@server/controllers/gameController";

export const { upgradeWebSocket, websocket } =
  createBunWebSocket<ServerWebSocket>();

export const gameRoutes = new Hono();

gameRoutes.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        handleOpen({ ws });
      },
      onMessage(event, ws) {
        handleMessage({ ws, event });
      },
      onClose: (event, ws) => {
        handleClose({ ws, event });
      },
    };
  }),
);
