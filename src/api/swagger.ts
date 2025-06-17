// src/api/swagger.ts
import { OpenAPIV3 } from 'openapi-types';

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const todayStr = `${yyyy}${mm}${dd}`;

export const swaggerDefinition: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Binance to Tradezella API',
    version: '1.0.0',
    description: 'API documentation for Binance to Tradezella',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local server' },
  ],
  paths: {
    '/trades/latest': {
      get: {
        tags: ['Trades'],
        summary: 'Get latest trades',
        description: 'Fetches the latest trades for all symbols as a JSON array',
        security: [{ ApiKeyAuth: [] }],
        responses: {
          '200': {
            description: 'Successfully retrieved latest trades',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Trade' },
                },
              },
            },
          },
          '401': { description: 'Unauthorized - Invalid or missing API key' },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/trades/date/{date}': {
      get: {
        tags: ['Trades'],
        summary: 'Get trades by date',
        description: 'Fetches all trades for a specific date in YYYYMMDD format',
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'date',
            required: true,
            description: 'Date in YYYYMMDD format (e.g., 20230615)',
            schema: {
              type: 'string',
              pattern: '^\\d{8}$',
              example: todayStr,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successfully retrieved trades for the specified date as CSV file',
            content: {
              'text/csv': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
            headers: {
              'Content-Disposition': {
                schema: { type: 'string' },
                description: "Attachment with filename in format 'trades-YYYYMMDD.csv'",
              },
            },
          },
          '400': {
            description: 'Bad request - Invalid date format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': { description: 'Unauthorized - Invalid or missing API key' },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
    },
    schemas: {
      Trade: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '12345' },
          symbol: { type: 'string', example: 'BTCUSDT' },
          price: { type: 'number', example: 30000.5 },
          quantity: { type: 'number', example: 0.01 },
          side: { type: 'string', example: 'BUY' },
          timestamp: { type: 'string', format: 'date-time', example: '2025-07-03T14:00:00Z' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error description' },
        },
      },
    },
  },
};
