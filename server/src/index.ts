import { Hono } from "hono";
import { cors } from "hono/cors";

import { serveStatic } from "hono/bun"; // Bun's built-in static middleware
import { gameRoutes, websocket } from "@server/routes/gameRoutes";

const port = parseInt(process.env.PORT || "3000");

const app = new Hono();
app.use(cors());

app.get("/", (c) => {
  console.log("HTTP request to root");
  return c.text("Server running with WebSocket support");
});

app.use("/static/*", serveStatic({ root: "./" }));
app.use(
  "/*",
  serveStatic({
    root: "./client/dist",
    rewriteRequestPath: (path) => (path === "/" ? "/index.html" : path),
  }),
);

app.route("/", gameRoutes);

// Catch-all: serve index.html for client-side routing (SPA fallback)
app.get("*", serveStatic({ path: "./client/dist/index.html" }));

export default {
  port: port,
  fetch: app.fetch,
  websocket,
};
