import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Configurations for Microservices endpoints
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:8002';
const FORUM_SERVICE_URL = process.env.FORUM_SERVICE_URL || 'http://localhost:8003';
const LAB_SERVICE_URL = process.env.LAB_SERVICE_URL || 'http://localhost:8004';
const TOURNAMENT_SERVICE_URL = process.env.TOURNAMENT_SERVICE_URL || 'http://localhost:8005';
const ACHIEVEMENT_SERVICE_URL = process.env.ACHIEVEMENT_SERVICE_URL || 'http://localhost:8006';

app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'API Gateway' });
});

// Proxy definitions
app.use('/api/v1/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/auth': '' },
}));

app.use('/api/v1/courses', createProxyMiddleware({
  target: COURSE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/courses': '' },
}));

app.use('/api/v1/forum', createProxyMiddleware({
  target: FORUM_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/forum': '' },
}));

app.use('/api/v1/labs', createProxyMiddleware({
  target: LAB_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/labs': '' },
}));

app.use('/api/v1/tournaments', createProxyMiddleware({
  target: TOURNAMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/tournaments': '' },
}));

app.use('/api/v1/achievements', createProxyMiddleware({
  target: ACHIEVEMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/achievements': '' },
}));

// Route fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found in Gateway' });
});

app.listen(PORT, () => {
  console.log(`[API Gateway] running on port ${PORT}`);
});
