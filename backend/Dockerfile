# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# copy manifests first so Docker caches the install layer
COPY package*.json tsconfig.json ./

RUN npm ci

# copy source and compile to JS
COPY src ./src

RUN npm run build

# ── Stage 2: production image ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# only install production deps in the final image
COPY package*.json ./
RUN npm ci --omit=dev

# copy compiled output from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
