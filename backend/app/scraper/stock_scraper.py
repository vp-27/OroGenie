import logging
import yfinance as yf
from flask_socketio import SocketIO
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize WebSocket communication with the Flask app
socketio = SocketIO(message_queue='redis://localhost:6379/')  # Assuming Redis is used as the message queue

class StockScraper:
    def __init__(self, stock_tickers=None):
        self.stock_tickers = stock_tickers or []
        self._cache = {}
        self._cache_ttl = 60  # Cache prices for 60 seconds

    def get_stock_price(self, ticker):
        """Get the current stock price for a given ticker using yfinance."""
        ticker = ticker.upper()
        
        # Check cache first
        cache_entry = self._cache.get(ticker)
        if cache_entry and (time.time() - cache_entry['timestamp']) < self._cache_ttl:
            logger.info(f"Returning cached price for {ticker}: {cache_entry['price']}")
            return cache_entry['price']
        
        try:
            stock = yf.Ticker(ticker)
            
            # Try multiple methods to get current price
            price = None
            
            # Method 1: Try fast_info (faster, less API calls)
            try:
                fast_info = stock.fast_info
                price = fast_info.get('lastPrice') or fast_info.get('last_price')
            except Exception:
                pass
            
            # Method 2: Try info dict if fast_info failed
            if price is None:
                try:
                    info = stock.info
                    price = info.get('regularMarketPrice') or info.get('currentPrice')
                except Exception:
                    pass
            
            # Method 3: Get latest history if info failed
            if price is None:
                try:
                    hist = stock.history(period='1d')
                    if not hist.empty:
                        price = hist['Close'].iloc[-1]
                except Exception:
                    pass
            
            if price is not None:
                price_str = f"{float(price):.2f}"
                # Update cache
                self._cache[ticker] = {
                    'price': price_str,
                    'timestamp': time.time()
                }
                logger.info(f"Fetched price for {ticker}: {price_str}")
                return price_str
            else:
                logger.warning(f"Could not fetch price for {ticker}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching price for {ticker}: {e}")
            return None

    def run(self):
        """Background task to continuously fetch and broadcast stock prices."""
        logger.info("Starting scraper...")
        while True:
            for ticker in self.stock_tickers:
                price = self.get_stock_price(ticker)
                if price:
                    self.broadcast_price_update(ticker, price)
                time.sleep(2)  # Add a small delay to avoid overloading the server
            time.sleep(30)  # Wait before checking prices again

    def broadcast_price_update(self, ticker, price):
        """Emit the stock price update to all connected WebSocket clients."""
        logger.info(f'Broadcasting new price for {ticker}: {price}')
        socketio.emit('stock_update', {'ticker': ticker, 'price': price}, namespace='/')

    def close(self):
        """Cleanup method (kept for compatibility)."""
        logger.info("Closing scraper...")


if __name__ == '__main__':
    # Test the scraper
    stock_tickers = ['AAPL', 'GOOGL', 'AMZN']
    scraper = StockScraper(stock_tickers)
    
    for ticker in stock_tickers:
        price = scraper.get_stock_price(ticker)
        print(f"{ticker}: ${price}")
