# Base stage
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN mkdir logs
RUN --mount=type=cache,target=/root/.npm npm install
# Explicitly generate Prisma client
RUN npx prisma generate

# Development stage
FROM base AS development
COPY . .
# The port is driven by .env.development
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
COPY . .
RUN npm run build
# Prune dev dependencies, leaving only production dependencies and the generated Prisma client
RUN npm prune --omit=dev

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
COPY package.json package-lock.json* ./
# Copy pruned node_modules from builder (includes Prisma generated client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 9001
CMD ["npm", "run", "start"]
