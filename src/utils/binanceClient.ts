import Binance from 'binance-api-node';
import dotenv from 'dotenv';

dotenv.config();

let client: ReturnType<typeof Binance> | null = null;

export function getClient() {
  if (!client) {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new Error('BINANCE_API_KEY and BINANCE_API_SECRET must be set in .env file');
    }
    client = Binance({ apiKey, apiSecret });
  }
  return client;
}
