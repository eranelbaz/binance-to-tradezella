import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerDefinition } from './api/swagger';
import tradesRouter from './api/routes/trades';
import { getClient } from './utils/binanceClient';

dotenv.config();

// Use code-based Swagger definition (dynamic example for /trades/date/{date})

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8800;

// Middleware
app.use(cors());

// Serve Swagger UI with code-based definition
defineSwaggerServers(swaggerDefinition, process.env);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

function defineSwaggerServers(swaggerDef: any, env: NodeJS.ProcessEnv) {
  // Optionally update servers dynamically based on env
  swaggerDef.servers = [
    { url: '/api', description: 'API Base Path' },
    { url: `http://localhost:${env.PORT ? parseInt(env.PORT, 10) : 8800}/api`, description: 'Development server' },
    { url: `http://${env.HOST || 'localhost'}:${env.PORT || 8800}/api`, description: 'Custom host' },
  ];
}

app.use(express.json());

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
const apiRouter = Router();
apiRouter.use('/trades', tradesRouter);

// Mount API routes under /api
app.use('/api', apiRouter);


// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Helper function to get local IP address
export function getLocalIpAddress(): string {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      const { address, family, internal } = iface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
  return 'localhost';
}

// Start the server

const server = app.listen(PORT, '0.0.0.0', async () => {
  const localIp = getLocalIpAddress();
  console.log("Initalize Binance Link");
  getClient()
  console.log("Done init Binance Link");
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access locally:      http://localhost:${PORT}`);
  console.log(`Access on network:   http://${localIp}:${PORT}`);
  console.log(`API Documentation:   http://${localIp}:${PORT}/`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;
