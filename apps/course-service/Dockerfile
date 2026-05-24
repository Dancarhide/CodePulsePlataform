FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/course-service/package*.json ./apps/course-service/
COPY libs/ ./libs/
RUN npm install
COPY apps/course-service/ ./apps/course-service/
RUN npm run build --filter=course-service

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/course-service/dist ./dist
COPY --from=builder /app/apps/course-service/package*.json ./
EXPOSE 8002
CMD ["npm", "run", "start"]
