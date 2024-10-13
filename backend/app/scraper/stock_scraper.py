import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from flask_socketio import SocketIO
import time
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize WebSocket communication with the Flask app
socketio = SocketIO(message_queue='redis://localhost:6379/')  # Assuming Redis is used as the message queue

class StockScraper:
    def __init__(self, stock_tickers):
        self.stock_tickers = stock_tickers
        self.driver = self.init_driver()

    def init_driver(self):
        options = ChromeOptions()
        options.add_argument('--headless')  # Run headless browser
        options.add_argument('--no-sandbox')  # Required for running in some containers
        options.add_argument('--disable-dev-shm-usage')  # Overcome limited resource problems
        # Use webdriver-manager to get the ChromeDriver
        service = ChromeService(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=options)

    def get_stock_price(self, ticker):
        url = f'https://finance.yahoo.com/quote/{ticker}'
        self.driver.get(url)
        try:
            # Wait for the price element to be present
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, f'[data-symbol="{ticker}"][data-field="regularMarketPrice"]'))
            )
            price_element = self.driver.find_element(By.CSS_SELECTOR, f'[data-symbol="{ticker}"][data-field="regularMarketPrice"]')
            price = price_element.text
            logger.info(f"Fetched price for {ticker}: {price}")
            return price
        except Exception as e:
            logger.error(f"Error fetching price for {ticker}: {e}")
            return None

    def run(self):
        logger.info("Starting scraper...")
        while True:
            for ticker in self.stock_tickers:
                price = self.get_stock_price(ticker)
                if price:
                    self.broadcast_price_update(ticker, price)
                time.sleep(2)  # Add a small delay to avoid overloading the server
            time.sleep(30)  # Wait before checking prices again

    def broadcast_price_update(self, ticker, price):
        # Emit the stock price update to all connected WebSocket clients
        print(f'Broadcasting new price for {ticker}: {price}')
        socketio.emit('stock_update', {'ticker': ticker, 'price': price}, namespace='/')

    def close(self):
        logger.info("Closing scraper...")
        self.driver.quit()

if __name__ == '__main__':
    # Define the list of stock tickers you want to scrape
    stock_tickers = ['AAPL', 'GOOGL', 'AMZN']

    # Create an instance of the scraper
    scraper = StockScraper(stock_tickers)

    try:
        scraper.run()
    except KeyboardInterrupt:
        scraper.close()
