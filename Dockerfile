# Build stage
FROM oven/bun:latest AS builder
WORKDIR /app

# copy lock + package files so bun install can use cache
COPY package.json bun.lockb ./
# copy workspaces package.json's (optional but helps cache)
COPY server/package.json server/package.json
COPY client/package.json client/package.json
COPY shared/package.json shared/package.json

RUN bun install --frozen-lockfile

# copy full repo and build everything (shared, server, client)
COPY . .
# run monorepo build (uses scripts in root package.json)
RUN bun run build

# Runtime stage (smaller surface)
FROM oven/bun:latest AS runtime
WORKDIR /app

# Copy only server runtime output and any static assets
# adjust paths if your server output is elsewhere
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
# copy bun.lockb and package.json if you need them (optional)
COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app/package.json ./

# Expose port your server listens on
EXPOSE 3000

# Run the built server file directly with bun
# Ensure server/dist/index.js exists and is runnable
CMD ["bun", "server/dist/index.js"]