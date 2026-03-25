FROM node:20-alpine AS builder
WORKDIR /app
COPY shared /app/shared
COPY services/orders-service /app/services/orders-service
WORKDIR /app/shared
RUN npm install && npm run build
WORKDIR /app/services/orders-service
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/shared /app/shared
COPY services/orders-service/package.json /app/services/orders-service/package.json
WORKDIR /app/services/orders-service
RUN npm install --omit=dev
COPY --from=builder /app/services/orders-service/dist ./dist
EXPOSE 4003
CMD ["node", "dist/index.js"]
