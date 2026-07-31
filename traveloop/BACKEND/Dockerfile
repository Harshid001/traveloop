FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY traveloop/BACKEND/package*.json ./traveloop/BACKEND/

RUN npm ci --workspace=traveloop/BACKEND --omit=dev

FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/traveloop/BACKEND/node_modules ./traveloop/BACKEND/node_modules

COPY package*.json ./
COPY traveloop/BACKEND/package*.json ./traveloop/BACKEND/
COPY traveloop/BACKEND/src ./traveloop/BACKEND/src
COPY traveloop/BACKEND/server.js ./traveloop/BACKEND/
COPY traveloop/BACKEND/ecosystem.config.js ./traveloop/BACKEND/
COPY traveloop/BACKEND/migrations ./traveloop/BACKEND/migrations
COPY traveloop/BACKEND/migrate-mongo-config.js ./traveloop/BACKEND/

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER nodejs

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "traveloop/BACKEND/server.js"]