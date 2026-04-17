FROM node:20-alpine AS builder
WORKDIR /app/shared
COPY .npmrc /app/.npmrc
COPY shared /app/shared
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --package-lock=false && npm run build
WORKDIR /app/services/auth-service
COPY services/auth-service /app/services/auth-service
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --package-lock=false && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/auth-service/node_modules /app/node_modules
COPY --from=builder /app/services/auth-service/dist /app/dist
COPY --from=builder /app/shared /app/shared
COPY services/auth-service/package.json /app/package.json
EXPOSE 4001
CMD ["node", "dist/index.js"]
