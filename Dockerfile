# Base stage
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN mkdir logs
RUN --mount=type=cache,target=/root/.npm npm install

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

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm install --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 9001
CMD ["npm", "run", "start"]
