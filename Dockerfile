# Build stage
FROM oven/bun:latest AS builder
WORKDIR /app

# Copy root + workspace package.json files to leverage Docker layer cache
COPY package.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
COPY shared/package.json shared/package.json

# Install dependencies (do not require a lockfile to exist)
RUN bun install

# Copy the full repo and run the monorepo build script
COPY . .
RUN bun run build

# Runtime stage (smaller surface)
FROM oven/bun:latest AS runtime
WORKDIR /app

# Copy only the built server (and client static files if you want to serve them here)
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Expose the port your server listens on
ENV PORT 3000
EXPOSE 3000

# Run the built server file directly
CMD ["bun", "server/dist/index.js"]