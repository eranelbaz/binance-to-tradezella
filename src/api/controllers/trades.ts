import { Request, Response } from 'express';
import tradeService from '../services/tradeService';
import { sendCsvResponse } from '../../utils/csvUtils';

class TradeController {
  /**
   * Get latest trades
   */
  async getLatestTrades(_req: Request, res: Response) {
    try {
      console.log('Fetching latest trades...');
      const trades = await tradeService.getLatestTrades();
      sendCsvResponse(res, trades, `latest-trades-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Get trades by date (YYYYMMDD)
   */
  async getTradesByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;
      const trades = await tradeService.getTradesByDate(date);
      
      // Send as CSV file
      sendCsvResponse(res, trades, `trades-${date}.csv`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const status = error instanceof Error && error.message.includes('Invalid date format') ? 400 : 500;
      
      // For API clients, still return JSON on error
      res.status(status).json({
        success: false,
        error: errorMessage
      });
    }
  }
}

export default new TradeController();
