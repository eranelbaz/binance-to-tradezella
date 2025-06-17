# TradeZella Syncer

A Node.js application that syncs Binance futures trades to TradeZella.

## Features

- Fetches futures trades from Binance for given pairs
- Provides REST API endpoints to get trade data in Tradezella CSV format

## API Endpoints

The application exposes the following REST API endpoints:

### Accessing the Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://{host}:{port}/api-docs
```

### Get Latest Trades

Fetches the most recent trades based on the last known trade times.

- **URL:** `/trades/latest`
- **Method:** `GET`
- **Response:**
    - **Content-Type:** `text/csv`
    - **File Name:** `latest-trades-YYYY-MM-DD.csv`
    - **Format:** CSV file formatted for TradeZella import

### Get Trades by Date

Fetches all trades for a specific date.

- **URL:** `/trades/date/:date`
- **Method:** `GET`
- **Parameters:**
    - `date` (path parameter): Date in YYYYMMDD format (e.g., `20230615`)
- **Response:**
    - **Content-Type:** `text/csv`
    - **File Name:** `trades-YYYYMMDD.csv`
    - **Format:** CSV file formatted for TradeZella import

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure your Binance API credentials as environment variables:
     ```
     BINANCE_API_KEY=your_binance_api_key_here
     BINANCE_API_SECRET=your_binance_api_secret_here
     ```
     
3. Configure what tickers you want to sync as environment variable:
    ```
    TRADING_PAIRS=BTCUSD,ETHUSD
    ```

## Usage

Run the application:

```
npm run dev  # For development with ts-node
```

or

```
npm run build  # Build TypeScript to JavaScript
npm start      # Run the compiled JavaScript
```

## Project Structure

- `src/index.ts` - Main application entry point
- `src/binance-fetcher.ts` - Module for fetching trades from Binance
- `.env` - Environment variables (API credentials)

## Requirements

- Node.js 22+
- TypeScript 5.5+
