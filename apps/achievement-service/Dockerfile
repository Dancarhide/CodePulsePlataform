FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/achievement-service/package*.json ./apps/achievement-service/
COPY libs/ ./libs/
RUN npm install
COPY apps/achievement-service/ ./apps/achievement-service/
RUN npm run build --filter=achievement-service

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/achievement-service/dist ./dist
COPY --from=builder /app/apps/achievement-service/package*.json ./
EXPOSE 8006
CMD ["npm", "run", "start"]
