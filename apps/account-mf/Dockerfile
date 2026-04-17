FROM node:20-alpine AS builder
WORKDIR /app
ARG STATE_MANAGER=redux
ENV STATE_MANAGER=$STATE_MANAGER
COPY .npmrc package.json tsconfig.base.json /app/
COPY shared /app/shared
COPY packages /app/packages
COPY apps /app/apps
RUN npm config set registry https://registry.npmjs.org/
RUN npm install --package-lock=false
RUN npm run build --workspace @grocery-delivery/account-mf

FROM nginx:1.27-alpine
COPY --from=builder /app/apps/account-mf/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
