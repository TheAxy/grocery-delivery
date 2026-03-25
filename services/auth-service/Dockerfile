FROM node:20-alpine AS builder
WORKDIR /app
COPY shared /app/shared
COPY services/auth-service /app/services/auth-service
WORKDIR /app/shared
RUN npm install && npm run build
WORKDIR /app/services/auth-service
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/shared /app/shared
COPY services/auth-service/package.json /app/services/auth-service/package.json
WORKDIR /app/services/auth-service
RUN npm install --omit=dev
COPY --from=builder /app/services/auth-service/dist ./dist
EXPOSE 4001
CMD ["node", "dist/index.js"]
