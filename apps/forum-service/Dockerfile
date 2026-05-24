FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/forum-service/package*.json ./apps/forum-service/
COPY libs/ ./libs/
RUN npm install
COPY apps/forum-service/ ./apps/forum-service/
RUN npm run build --filter=forum-service

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/forum-service/dist ./dist
COPY --from=builder /app/apps/forum-service/package*.json ./
EXPOSE 8003
CMD ["npm", "run", "start"]
