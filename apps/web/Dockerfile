FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/web/package*.json ./apps/web/
COPY libs/ ./libs/
RUN npm install
COPY apps/web/ ./apps/web/
RUN npm run build --filter=web

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
