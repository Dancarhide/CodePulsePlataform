import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import { prisma } from '@codepulse/database';
import { createLogger } from '@codepulse/core-logger';
import { EventType } from '@codepulse/event-contracts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8006;
const logger = createLogger('AchievementService');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672/';

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'UP', 
      service: 'Achievement Service',
      database: 'CONNECTED'
    });
  } catch (error) {
    logger.error('Database connection failed in health check', error);
    res.status(500).json({ 
      status: 'DOWN', 
      service: 'Achievement Service',
      database: 'DISCONNECTED',
      error: String(error)
    });
  }
});

// RabbitMQ Event Consumer Skeleton
async function startEventConsumer() {
  try {
    logger.info(`Connecting to RabbitMQ at: ${RABBITMQ_URL}`);
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'achievement_queue';

    await channel.assertQueue(queue, { durable: true });
    logger.info(`Listening for events on queue: ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        try {
          const event = JSON.parse(msg.content.toString());
          logger.info(`Received event: ${event.eventType}`, event);

          // Handle events such as EventType.LAB_COMPLETED or EventType.TOURNAMENT_WON
          // Place your custom event handlers here!
          
          channel.ack(msg);
        } catch (err) {
          logger.error('Error processing event message', err);
          channel.nack(msg, false, false); // Drop corrupt message
        }
      }
    });

  } catch (err) {
    logger.warn('Failed to start RabbitMQ consumer (Ensure RabbitMQ is running in Docker)', err);
  }
}

// Start Express application and background consumers
app.listen(PORT, () => {
  logger.info(`[Achievement Service] running on port ${PORT}`);
  startEventConsumer();
});
