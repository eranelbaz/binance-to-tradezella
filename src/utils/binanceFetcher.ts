/**
 * Binance Fetcher
 * 
 * This module fetches trade data from Binance for specified trading pairs
 * using the Binance API. It authenticates with credentials from the .env file.
 */

import { FuturesUserTradeResult } from 'binance-api-node';
import { readLatestTradeTimes } from './latestTimeHandler';
import { getClient } from './binanceClient';

// Define the trading pairs to fetch
export const TRADING_PAIRS = process.env.TRADING_PAIRS?.split(',').map(pair => pair.trim()) || [];

/**
 * Fetches futures user trades for specified symbol from Binance
 * 
 * @param symbol - Trading pair symbol (e.g. 'BTCUSDT')
 * @param limit - Optional limit on number of trades to return (default: 500)
 * @param startTime - Optional start time to fetch trades from (default: undefined)
 * @returns Promise resolving to array of trade objects
 */
const fetchFuturesTrades = async (
  symbol: string,
  limit: number = 500,
  startTime?: number
): Promise<FuturesUserTradeResult[]> => {
  try {
    console.log(`Fetching futures trades for ${symbol}${startTime ? ` since ${new Date(startTime).toISOString()}` : ''}...`);
    
    // Create params object without undefined values
    const params: { symbol: string; limit: number; startTime?: number } = {
      symbol,
      limit
    };
    
    // Only add startTime if it's defined
    if (startTime) {
      params.startTime = startTime;
    }
    
    const trades = await getClient().futuresUserTrades(params);
    
    console.log(`Successfully fetched ${trades.length} trades for ${symbol}`);
    return trades;
  } catch (error) {
    console.error(`Error fetching futures trades for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetches futures trades for all configured trading pairs
 * 
 * @param useLatestTimes - Whether to use saved latest trade times (default: true)
 * @returns Promise resolving to a map of symbol to trades array
 */
export const fetchAllFuturesTrades = async (useLatestTimes: boolean = true): Promise<Record<string, FuturesUserTradeResult[]>> => {
  const results: Record<string, FuturesUserTradeResult[]> = {};
  
  // Get the latest trade times if we're using them
  const latestTimes = useLatestTimes ? readLatestTradeTimes() : {};
  
  await Promise.all(
    TRADING_PAIRS.map(async (symbol) => {
      try {
        // Get the last trade time for this symbol if available
        const lastTradeTime = latestTimes[symbol];

        // Fetch trades, using the last trade time if available
        results[symbol] = await fetchFuturesTrades(
          symbol,
          500,
          lastTradeTime ? lastTradeTime + 1 : undefined // Add 1ms to avoid duplicate trades
        );
      } catch (error) {
        console.error(`Failed to fetch trades for ${symbol}`, error);
        results[symbol] = [];
      }
    })
  );
  
  return results;
};
