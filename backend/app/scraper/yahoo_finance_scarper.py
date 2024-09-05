# import time
# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.chrome.options import Options
# from webdriver_manager.chrome import ChromeDriverManager

# def get_stock_price(ticker, duration=5):
#     chrome_options = Options()
#     # chrome_options.add_argument("--headless")  # Run in headless mode for production

#     # Use webdriver-manager to automatically handle ChromeDriver
#     service = Service(ChromeDriverManager().install())
#     driver = webdriver.Chrome(service=service, options=chrome_options)

#     try:
#         url = f'https://finance.yahoo.com/quote/{ticker}'
#         driver.get(url)

#         selector = f'[data-symbol="{ticker.upper()}"][data-field="regularMarketPrice"]'
#         end_time = time.time() + duration

#         last_price = None
#         while time.time() < end_time:
#             try:
#                 price_element = driver.find_element(By.CSS_SELECTOR, selector)
#                 current_price = price_element.text
#                 if current_price != last_price:
#                     print(f"Updated Price: {current_price}")
#                     last_price = current_price
#             except Exception as e:
#                 print(f"Error fetching stock price for {ticker}: {e}")
            
#             time.sleep(0.5)  # Poll every 0.5 seconds

#         return last_price

#     finally:
#         driver.quit()

# # Example usage: Get AAPL stock price for 5 seconds
# # print(get_stock_price("AAPL", duration=5))
