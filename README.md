# OroGenie - A New Approach to Trading Dashboards
Revamped Trading Dashboard | Real Time Stock Data | Paper Trader | Python Algorithmic Trader Trader | 

OroGenie is a full-featured web application designed to enhance the user experience of traditional brokerage platforms. Built with a focus on clean, intuitive UI/UX and backed by a powerful full-stack framework, OroGenie provides users with a seamless interface for tracking stock performance, simulating trades, and more.

## Key Features

- **UI/UX Design:** OroGenie employs neumorphism with accessibility in mind, providing a sleek, clean, and intuitive user interface. The design also visualizes stock performance, making it easier to interpret at a glance. OroGenie features a one-page dashboard to prevent users from feeling overwhelmed by too much navigation.
  
- **Full-Stack Development:** The application is built using Python (Flask), React, and SQLAlchemy to create a robust, scalable backend and a responsive frontend.
  
- **Secure Authentication:** JWT (JSON Web Tokens) has been implemented to safeguard user data. However, please note the security advisory below.
  
- **Paper Trading:** OroGenie includes a paper trading system to simulate real market conditions, allowing users to test strategies without risking real money.
  
- **Real-Time Data Integration:** OroGenie uses Selenium web scraping to fetch live stock data from Yahoo Finance, ensuring real-time accuracy for stock prices.
  
- **Dynamic Portfolio Visualization:** The dashboard offers Recharts-powered data visualizations, allowing users to track stock performance over time.
  
- **AI Assistant:** A built-in AI assistant helps automate various tasks, improving the overall user experience.

## Security Notice

While the application is currently secured with JWT-based authentication, **the keys in this repository are not encrypted or hidden, even though user data and passwords are encrypted the decryption keys are yet to be hidden**. This makes the app **insecure for personal use** with real financial or sensitive data. **Do not use OroGenie with your personal or financial information.** Feel free to explore the features and test the app with sample data.

We recommend using a dummy account for testing purposes. **If you plan to deploy the app in a production environment, please implement proper key management and secure any sensitive data before doing so.**

## Installation

To get started with OroGenie, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vp-27/OroGenie
   cd orogenie
   ```

2. **Backend setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install the backend dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Set up your environment variables for Flask, JWT, and database configurations:
     ```bash
     export FLASK_APP=run.py
     export SECRET_KEY='your-secret-key'
     export JWT_SECRET_KEY='your-jwt-secret-key'
     ```
   - Run the Flask server:
     ```bash
     python3 run.py
     ```

3. **Frontend setup**:
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install the frontend dependencies:
     ```bash
     npm install
     ```
   - Run the React frontend:
     ```bash
     npm start
     ```

4. **Access the app**:
   - Visit `http://localhost:3000` for the frontend.
   - The backend runs on `http://127.0.0.1:5000`.


## What's Next?

I'm currently working on:
- A Python-based algorithmic trader to automate financial decisions.
- Automating tax style sheet creation for even paper trading transactions.
- Adding more customization options to enhance the user experience.

## Contributing

Contributions to OroGenie are welcome! Feel free to open a pull request or submit an issue to help improve the project.

---

Let me know if you’d like any adjustments!
