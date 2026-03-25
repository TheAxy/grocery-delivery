FROM node:20-alpine AS builder
WORKDIR /app
COPY shared /app/shared
COPY services/catalog-service /app/services/catalog-service
WORKDIR /app/shared
RUN npm install && npm run build
WORKDIR /app/services/catalog-service
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/shared /app/shared
COPY services/catalog-service/package.json /app/services/catalog-service/package.json
WORKDIR /app/services/catalog-service
RUN npm install --omit=dev
COPY --from=builder /app/services/catalog-service/dist ./dist
EXPOSE 4002
CMD ["node", "dist/index.js"]
