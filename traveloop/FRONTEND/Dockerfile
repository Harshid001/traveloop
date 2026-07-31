FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY traveloop/FRONTEND/package*.json ./traveloop/FRONTEND/

RUN npm ci --workspace=traveloop/FRONTEND

COPY traveloop/FRONTEND/ ./traveloop/FRONTEND/

RUN npm run build -w traveloop/FRONTEND

FROM nginx:1.27-alpine AS production

COPY traveloop/FRONTEND/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/traveloop/FRONTEND/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]