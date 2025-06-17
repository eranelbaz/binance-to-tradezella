/**
 * Main application entry point for Tradezella Syncer
 * 
 * This application provides an API to fetch Binance Futures trades in a format
 * compatible with TradeZella.
 */

import app from './server';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8800;

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  const localIp = require('./server').getLocalIpAddress();
  console.log(`\n=== Tradezella Syncer ===`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`\nAccess URLs:`);
  console.log(`- Local:      http://localhost:${PORT}`);
  console.log(`- Network:    http://${localIp}:${PORT}`);
  console.log(`\nAPI Documentation:`);
  console.log(`- Swagger UI: http://${localIp}:${PORT}/\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  // Consider doing cleanup here if needed
  process.exit(1);
});

export default server;
