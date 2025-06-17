import {fetchAllFuturesTrades} from '../../utils/binanceFetcher';
import {updateLatestTradeTimes} from '../../utils/latestTimeHandler';
import {convertTradesToCSV} from '../../utils/formatter';

class TradeService {
    /**
     * Fetches the latest trades based on the last known trade times
     */
    async getLatestTrades() {
        try {
            const tradesBySymbol = await fetchAllFuturesTrades(true);
            // Update the latest trade times
            updateLatestTradeTimes(tradesBySymbol);

            // Convert the record of symbol to trades into a flat array of all trades
            const allTrades = Object.values(tradesBySymbol).flat();

            // Convert trades to CSV format
            return convertTradesToCSV(allTrades);
        } catch (error) {
            console.error('Error in getLatestTrades:', error);
            throw new Error('Failed to fetch latest trades');
        }
    }

    /**
     * Fetches trades for a specific date (YYYYMMDD format)
     * @param dateString Date in YYYYMMDD format
     */
    async getTradesByDate(dateString: string) {
        try {
            // Validate date format (YYYYMMDD)
            if (!/^\d{8}$/.test(dateString)) {
                throw new Error('Invalid date format. Please use YYYYMMDD format.');
            }

            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            const startTime = new Date(`${year}-${month}-${day}T00:00:00.000Z`).getTime();
            const endTime = new Date(`${year}-${month}-${day}T23:59:59.999Z`).getTime();

            // Get all trades without using latest times
            const allTradesBySymbol = await fetchAllFuturesTrades(false);

            // Convert to a flat array of all trades across all symbols
            const allTrades = Object.values(allTradesBySymbol).flat();

            // Filter trades for the specific date
            const filteredTrades = allTrades.filter((trade: any) => {
                const tradeTime = new Date(trade.time).getTime();
                return tradeTime >= startTime && tradeTime <= endTime;
            });

            // Convert trades to CSV format
            return convertTradesToCSV(filteredTrades);
        } catch (error) {
            console.error('Error in getTradesByDate:', error);
            throw error;
        }
    }
}

export default new TradeService();
