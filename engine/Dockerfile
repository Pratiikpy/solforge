FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source
COPY . .

# Build TypeScript
RUN npx tsc || true

# The engine runs in demo mode by default (no Rust/Anchor toolchain needed)
ENV BUILD_MODE=demo
ENV PORT=3002

EXPOSE 3002

CMD ["npx", "tsx", "src/index.ts"]
