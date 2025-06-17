import { Router } from 'express';
import tradeController from '../controllers/trades';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Trades
 *   description: API for managing Binance trades
 * 
 * /trades/latest:
 *   get:
 *     tags: [Trades]
 *     summary: Get the latest trades
 *     description: Fetches the most recent trades based on the last known trade times from latest-trade-times.json
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved latest trades as CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *             description: Attachment with filename in format 'latest-trades-YYYY-MM-DD.csv'
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * components:
 *   schemas:
 *     Trade:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: Trade ID
 *         symbol:
 *           type: string
 *           description: Trading pair symbol
 *         orderId:
 *           type: number
 *           description: Order ID
 *         price:
 *           type: string
 *           format: decimal
 *           description: Trade price
 *         qty:
 *           type: string
 *           format: decimal
 *           description: Trade quantity
 *         quoteQty:
 *           type: string
 *           format: decimal
 *           description: Quote quantity
 *         commission:
 *           type: string
 *           format: decimal
 *           description: Commission paid
 *         commissionAsset:
 *           type: string
 *           description: Asset used to pay commission
 *         time:
 *           type: number
 *           format: int64
 *           description: Trade timestamp in milliseconds
 *         isBuyer:
 *           type: boolean
 *           description: Whether the trade was a buy order
 *         isMaker:
 *           type: boolean
 *           description: Whether the trade was a maker order
 *         isBestMatch:
 *           type: boolean
 *           description: Whether the trade was the best price match
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Error description"
 */
router.get('/latest', tradeController.getLatestTrades);


router.get('/date/:date', tradeController.getTradesByDate);

export default router;
