import app from './app';
import { config } from './config/env';
import { connectDB, closeDB } from './config/db';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`[SmartFarmer Backend] Server running on http://localhost:${config.port}`);
    });

    const shutdown = async () => {
      console.log('[SmartFarmer Backend] Shutting down gracefully...');
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[SmartFarmer Backend] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
