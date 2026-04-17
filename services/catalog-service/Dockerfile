FROM node:20-alpine AS builder
WORKDIR /app/shared
COPY .npmrc /app/.npmrc
COPY shared /app/shared
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --package-lock=false && npm run build
WORKDIR /app/services/catalog-service
COPY services/catalog-service /app/services/catalog-service
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --package-lock=false && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/catalog-service/node_modules /app/node_modules
COPY --from=builder /app/services/catalog-service/dist /app/dist
COPY --from=builder /app/shared /app/shared
COPY services/catalog-service/package.json /app/package.json
EXPOSE 4002
CMD ["node", "dist/index.js"]
