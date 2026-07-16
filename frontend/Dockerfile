# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: serve with nginx ────────────────────────────────────────────────
FROM nginx:alpine AS runner

# remove the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config that handles React Router (all routes fall back to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
