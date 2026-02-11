import app from './app.js';
import { config } from './config/index.js';
import { syncDatabase } from './config/database.js';
import logger from './utils/logger.js';
import {
  startReservationReminderScheduler,
  stopReservationReminderScheduler
} from './modules/reservations/reservation-reminder.service.js';

/**
 * Server Configuration
 */
const PORT = config.port || 3000;
const HOST = config.host || '0.0.0.0';

/**
 * Server instance
 */
let server;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect and sync database
    logger.info('Connecting to database...');
    await syncDatabase();
    logger.info('✅ Database connected and synced');

    // Start Express server
    server = app.listen(PORT, HOST, () => {
      logger.info(`✅ Server is running on http://${HOST}:${PORT}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Base URL: http://${HOST}:${PORT}/api/v1`);
      logger.info(`Health Check: http://${HOST}:${PORT}/health`);
    });
    startReservationReminderScheduler();

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 */
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('✅ HTTP server closed');
      stopReservationReminderScheduler();

      try {
        // Close database connection
        const { sequelize } = await import('./config/database.js');
        await sequelize.close();
        logger.info('✅ Database connection closed');

        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

/**
 * Handle Process Signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Handle Uncaught Exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

/**
 * Handle Unhandled Promise Rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

/**
 * Start the server
 */
startServer();

