FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/api-gateway/package*.json ./apps/api-gateway/
COPY libs/ ./libs/
RUN npm install
COPY apps/api-gateway/ ./apps/api-gateway/
RUN npm run build --filter=api-gateway

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package*.json ./
EXPOSE 8000
CMD ["npm", "run", "start"]
