import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '@codepulse/database';
import { createLogger } from '@codepulse/core-logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;
const logger = createLogger('CourseService');

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Basic test of database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'UP', 
      service: 'Course Service',
      database: 'CONNECTED'
    });
  } catch (error) {
    logger.error('Database connection failed in health check', error);
    res.status(500).json({ 
      status: 'DOWN', 
      service: 'Course Service',
      database: 'DISCONNECTED',
      error: String(error)
    });
  }
});

// Start Express application
app.listen(PORT, () => {
  logger.info(`[Course Service] running on port ${PORT}`);
});
