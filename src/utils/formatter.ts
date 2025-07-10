/**
 * Formatter Module
 * 
 * Handles formatting of trade data for different output formats (CSV, etc.)
 */

import { FuturesUserTradeResult } from 'binance-api-node';
import { getClient } from './binanceClient';

export const PAIR_WITH = process.env.PAIR_WITH!;

// Format a date in New York timezone
const formatInNYTZ = (date: Date | number, options: Intl.DateTimeFormatOptions): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    ...options
  }).format(new Date(date));
};

// Format a date as M/d/yy in New York timezone
const formatNYDate = (date: Date | number): string => {
  return formatInNYTZ(date, {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  });
};

// Format a time as HH:mm:ss in New York timezone
const formatNYTime = (date: Date | number): string => {
  return formatInNYTZ(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Type definition for CSV record format
 */
export interface TradeCSVRecord {
  Date: string;
  Time: string;
  Symbol: string;
  'Buy/Sell': string;
  Quantity: string;
  Price: string;
  Spread: string;
  Expiration: string;
  Strike: string;
  'Call/Put': string;
  Commission: number;
  Fees: string;
}

/**
 * Convert commission to PAIR_WITH asset if needed
 * @param commission - the original commission amount
 * @param commissionAsset - the asset in which the commission was paid
 * @param pairWith - the target asset to convert to (e.g., USDC)
 * @returns commission in the target asset
 */
const convertCommissionToPair = async (
  commission: number,
  commissionAsset: string,
  pairWith: string
): Promise<number> => {
  if (commissionAsset !== pairWith) {
    const commisionSymbol = `BNB${pairWith}`;
    const futuresPrices = await getClient().futuresPrices({ symbol: commisionSymbol });
    const bnbPairPrice = parseFloat(futuresPrices[commisionSymbol]);
    return commission * bnbPairPrice;
  }
  return commission;
};

/**
 * Convert a Binance futures trade to a CSV record in New York timezone
 * 
 * @param trade - Binance futures trade to convert
 * @returns Trade record in the specified CSV format with NY timezone
 */
const convertTradeToCSVRecord = async (trade: FuturesUserTradeResult): Promise<TradeCSVRecord> => {
    // Format date and time in New York timezone
    const dateStr = formatNYDate(trade.time);
    const timeStr = formatNYTime(trade.time);
    let commission: number = await convertCommissionToPair(parseFloat(trade.commission), trade.commissionAsset, PAIR_WITH);
    return {
      Date: dateStr,
      Time: timeStr,
      Symbol: trade.symbol,
      'Buy/Sell': trade.side,
      Quantity: trade.qty,
      Price: trade.price,
      Spread: 'Crypto', // Always 'Crypto' for these trades
      Expiration: '',   // Empty for Crypto
      Strike: '',       // Empty for Crypto
      'Call/Put': '',   // Empty for Crypto
      Commission: commission,
      Fees: '',         // Using the Commission field for fees
    };
};

/**
 * Converts an array of trades to CSV records
 * 
 * @param trades - Array of trade objects to convert
 * @returns Array of CSV-formatted trade records
 */
export const convertTradesToCSV = async (trades: FuturesUserTradeResult[]): Promise<TradeCSVRecord[]> => {
  return await Promise.all(trades.map(trade => convertTradeToCSVRecord(trade)));
};
