/**
 * Trade Time Tracker Module
 * 
 * This module handles tracking the latest trade times for each symbol
 * to enable incremental fetching of new trades.
 */

import fs from 'fs';
import path from 'path';
import { FuturesUserTradeResult } from 'binance-api-node';

// Path to the file storing latest trade times
const LATEST_TRADE_TIMES_FILE = path.resolve(__dirname, '../../data/latest-trade-times.json');

/**
 * Type definition for tracking the latest trade time per symbol
 */
export interface LatestTradeTimes {
  [symbol: string]: number; // Timestamp in milliseconds
}

/**
 * Reads the latest trade times from the JSON file
 * 
 * @returns Object mapping symbols to their latest trade time
 */
export const readLatestTradeTimes = (): LatestTradeTimes => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(LATEST_TRADE_TIMES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Read the file if it exists
    if (fs.existsSync(LATEST_TRADE_TIMES_FILE)) {
      const data = fs.readFileSync(LATEST_TRADE_TIMES_FILE, 'utf8');
      return JSON.parse(data) as LatestTradeTimes;
    }
    
    // Return empty object if file doesn't exist yet
    return {};
  } catch (error) {
    console.error('Error reading latest trade times:', error);
    return {};
  }
};

/**
 * Updates the latest trade times file with new timestamps
 * 
 * @param trades - The trades from which to extract the latest times
 */
export const updateLatestTradeTimes = (trades: Record<string, FuturesUserTradeResult[]>): void => {
  try {
    // Read existing times
    const latestTimes = readLatestTradeTimes();
    
    // Update with new latest times
    for (const [symbol, symbolTrades] of Object.entries(trades)) {
      if (symbolTrades.length > 0) {
        // Find the trade with the most recent timestamp
        const latestTradeTime = Math.max(...symbolTrades.map(trade => trade.time));
        
        // Only update if this is newer than our previously saved time
        if (!latestTimes[symbol] || latestTradeTime > latestTimes[symbol]) {
          latestTimes[symbol] = latestTradeTime;
        }
      }
    }
    
    // Save updated times
    const dataDir = path.dirname(LATEST_TRADE_TIMES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(LATEST_TRADE_TIMES_FILE, JSON.stringify(latestTimes, null, 2));
    console.log('Updated latest trade times');
  } catch (error) {
    console.error('Error updating latest trade times:', error);
  }
};

