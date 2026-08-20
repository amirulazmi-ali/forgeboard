FROM node:22-bookworm-slim AS builder

ENV NODE_ENV=production \
    PORT=4173 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build \
    && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=4173 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/server ./server
COPY --chown=node:node --from=builder /app/database ./database
COPY --chown=node:node --from=builder /app/scripts ./scripts

RUN mkdir -p /app/data \
    && chown node:node /app/data

USER node

EXPOSE 4173

CMD ["npm", "run", "start"]
