# Stage 1: Build stage
FROM node:22.15-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Verify the build
RUN echo "=== Built files in dist ===" && \
    find /app/dist -type f | sort && \
    echo "\n=== Node version ===" && \
    node --version

# Stage 2: Production stage
FROM node:22.15-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser
EXPOSE 8800

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8800/api/health || exit 1

CMD ["node", "dist/server.js"]
