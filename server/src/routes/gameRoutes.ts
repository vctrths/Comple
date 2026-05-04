import type { ServerWebSocket } from "bun";

import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { handleClose, handleMessage } from "@server/controllers/gameController";

export const { upgradeWebSocket, websocket } =
  createBunWebSocket<ServerWebSocket>();

export const gameRoutes = new Hono();

gameRoutes.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        console.log("WebSocket connection opened");
        ws.send(
          JSON.stringify({
            type: "connected",
            message: "Connected to game server",
          }),
        );
      },
      onMessage(event, ws) {
        const data = JSON.parse(event.data as string);
        handleMessage(ws, data);
        console.log(`Message from client: ${event.data}`);
      },
      onClose: (event, ws) => {
        handleClose(ws, event);
      },
    };
  }),
);
