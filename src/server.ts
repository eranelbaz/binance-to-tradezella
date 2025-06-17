import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import tradesRouter from './api/routes/trades';

dotenv.config();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tradezella Syncer API',
      version: '1.0.0',
      description: 'API for syncing and fetching Binance trades',
      contact: {
        name: 'Tradezella Support',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Base Path',
      },
      {
        url: `http://localhost:${process.env.PORT ? parseInt(process.env.PORT, 10) : 8800}/api`,
        description: 'Development server',
      },
      {
        url: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 8800}/api`,
        description: 'Custom host',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./dist/api/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8800;

// Middleware
app.use(cors());
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

// API Documentation - Moved to /api-docs to avoid conflicts
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { 
  explorer: true,
  swaggerOptions: {
    urls: [{
      url: '/api-docs-json',
      name: 'Tradezella Syncer API'
    }]
  }
}));

// Serve OpenAPI spec at /api-docs-json
app.get('/api-docs-json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

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
const server = app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
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
