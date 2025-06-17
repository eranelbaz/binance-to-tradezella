/**
 * Formatter Module
 * 
 * Handles formatting of trade data for different output formats (CSV, etc.)
 */

import { FuturesUserTradeResult } from 'binance-api-node';

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
  Commission: string;
  Fees: string;
}

/**
 * Convert a Binance futures trade to a CSV record in New York timezone
 * 
 * @param trade - Binance futures trade to convert
 * @returns Trade record in the specified CSV format with NY timezone
 */
const convertTradeToCSVRecord = (trade: FuturesUserTradeResult): TradeCSVRecord => {
  try {
    // Format date and time in New York timezone
    const dateStr = formatNYDate(trade.time);
    const timeStr = formatNYTime(trade.time);
    
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
      Commission: trade.commission,
      Fees: '',         // Using the Commission field for fees
    };
  } catch (error) {
    console.error('Error formatting trade date:', error);
    // Fallback to UTC if timezone conversion fails
    const tradeDate = new Date(trade.time);
    return {
      Date: `${tradeDate.getMonth() + 1}/${tradeDate.getDate()}/${tradeDate.getFullYear().toString().slice(-2)}`,
      Time: tradeDate.toTimeString().split(' ')[0],
      Symbol: trade.symbol,
      'Buy/Sell': trade.side,
      Quantity: trade.qty,
      Price: trade.price,
      Spread: 'Crypto',
      Expiration: '',
      Strike: '',
      'Call/Put': '',
      Commission: trade.commission,
      Fees: '',
    };
  }
};

/**
 * Converts an array of trades to CSV records
 * 
 * @param trades - Array of trade objects to convert
 * @returns Array of CSV-formatted trade records
 */
export const convertTradesToCSV = (trades: FuturesUserTradeResult[]): TradeCSVRecord[] => {
  return trades.map(trade => convertTradeToCSVRecord(trade));
};
