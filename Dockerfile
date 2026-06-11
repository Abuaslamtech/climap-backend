FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 300000

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS builder

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

FROM builder AS prod-deps

RUN npm prune --omit=dev && npm cache clean --force

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
