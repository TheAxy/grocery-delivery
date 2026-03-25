FROM node:20-alpine AS builder
WORKDIR /app
COPY shared /app/shared
COPY frontend /app/frontend
WORKDIR /app/shared
RUN npm install && npm run build
WORKDIR /app/frontend
RUN npm install && npm run build

FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
