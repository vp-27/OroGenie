import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Search, Moon, Sun, Edit, LogOut, ChartSpline, ChartCandlestick } from 'lucide-react';
// LineChart
import TradingViewWidget from './TradingViewWidget';
import '../styles/dashboard.css';
// import { TypeAnimation } from 'react-type-animation';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import io from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TransactionLog from './TransactionLog';

let backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5001/';
if (backendUrl && !backendUrl.startsWith('http')) {
  backendUrl = `https://${backendUrl}`;
}
const socket = io(backendUrl);

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStock, setCurrentStock] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [tickers, setTickers] = useState([]); // New state for tickers
  const [filteredTickers, setFilteredTickers] = useState([]);
  const [gainersPrices, setGainersPrices] = useState({});
  const [losersPrices, setLosersPrices] = useState({});
  const [code, setCode] = useState('');
  const [showChart, setShowChart] = useState(true);
  const [chartType, setChartType] = useState('simple');

  // Paper Trading States
  const [tradeType, setTradeType] = useState('market'); // 'market' or 'limit'
  const [sharesToTrade, setSharesToTrade] = useState(0);
  const [limitPrice, setLimitPrice] = useState('');

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioHistory, setPortfolioHistory] = useState([]);

  const [investedCash, setInvestedCash] = useState(0);
  const [showPortfolioChart, setShowPortfolioChart] = useState(false);

  const [scrollPosition, setScrollPosition] = useState(0);


  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/user-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data', error);
    }
  };

  const fetchPortfolioValueHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/portfolio-value-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolioHistory(response.data.portfolio_history.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleString(),
        value: parseFloat(item.value.toFixed(2))
      })));
    } catch (error) {
      console.error('Error fetching portfolio value history', error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/user-portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(prevData => ({
        ...prevData,
        portfolio: response.data.portfolio,
        portfolio_value: response.data.portfolio_value,
        uninvested_cash: response.data.uninvested_cash,
        invested_cash: response.data.invested_cash
      }));
      setInvestedCash(response.data.invested_cash);
    } catch (error) {
      console.error('Error fetching portfolio data', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPortfolioValueHistory();
    fetchPortfolio();

    const fetchTopGainers = async () => {
      try {
        const response = await axios.get('/top-gainers');
        const gainersData = response.data.data.map(stock => ({
          symbol: stock.ticker.disSymbol,
          price: stock.values.price,
          change: stock.values.changeRatio,
        }));
        setTopGainers(gainersData);
      } catch (error) {
        console.error('Error fetching top gainers', error);
      }
    };

    const fetchTopLosers = async () => {
      try {
        const response = await axios.get('/top-losers');
        const losersData = response.data.data.map(stock => ({
          symbol: stock.ticker.disSymbol,
          price: stock.values.price,
          change: stock.values.changeRatio,
        }));
        setTopLosers(losersData);
      } catch (error) {
        console.error('Error fetching top losers', error);
      }
    };

    const fetchTickers = async () => {
      try {
        const response = await axios.get('/fetch-tickers');
        const tickersData = Object.values(response.data).map(item => ({
          symbol: item.ticker,
          name: item.title
        }));
        setTickers(tickersData);
      } catch (error) {
        console.error('Error fetching tickers', error);
      }
    };
    fetchTopGainers();
    fetchTopLosers();
    fetchTickers();

    socket.on('stock_update', (data) => {
      if (data.ticker === currentStock.symbol) {
        setCurrentStock((prevStock) => ({ ...prevStock, price: data.price }));
      }
    });

    return () => {
      socket.off('stock_update');
    };
  }, [currentStock.symbol]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleEditMode = () => setEditMode(!editMode);

  const handleScroll = useCallback(() => {
    // Use requestAnimationFrame for smooth updates
    window.requestAnimationFrame(() => {
      setScrollPosition(window.scrollY);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);



  const handleSearch = async (e, ticker = null) => {
    setShowPortfolioChart(false);
    setShowChart(true);
    e?.preventDefault(); // Prevent default behavior if event is provided
    const searchTicker = ticker || searchTerm.trim().toUpperCase(); // Use ticker if provided, otherwise use searchTerm

    // Only validate if ticker is not passed (i.e., search bar is used)
    if (!ticker) {
      const isValidTicker = filteredTickers.some(t => t.symbol.toUpperCase() === searchTicker);

      if (!isValidTicker) {
        // Trigger the invalid effect
        const inputElement = document.querySelector('.sticky-bar input');
        inputElement.classList.add('invalid');

        setTimeout(() => {
          inputElement.classList.remove('invalid');
        }, 1000); // Duration of the animation

        return; // Exit early if ticker is invalid
      }
    }

    try {
      const response = await axios.post('/get-stock-price', { ticker: searchTicker });
      if (response.data.price) {
        const newStock = {
          symbol: searchTicker,
          name: searchTicker,
          price: response.data.price,
          shares: 0
        };
        setCurrentStock(newStock);
        setShowChart(true);

        // Update stock tile prices
        if (topGainers.some(stock => stock.symbol === searchTicker)) {
          setGainersPrices(prev => ({
            ...prev,
            [searchTicker]: response.data.price
          }));
        }
        if (topLosers.some(stock => stock.symbol === searchTicker)) {
          setLosersPrices(prev => ({
            ...prev,
            [searchTicker]: response.data.price
          }));
        }
      } else {
        console.error('Stock price not found');
      }
    } catch (error) {
      console.error('Error fetching stock price:', error);
    }
  };

  const toggleChartType = () => {
    setChartType(prev => prev === 'simple' ? 'advanced' : 'simple');
  };

  const handlePortfolioBarClick = () => {
    setShowPortfolioChart(true);
    setShowChart(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      const filtered = tickers.filter(ticker =>
        ticker.symbol.toLowerCase().includes(value.toLowerCase()) ||
        ticker.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTickers(filtered);
    } else {
      setFilteredTickers([]);
    }
  };

  const handleSuggestionClick = (ticker) => {
    setSearchTerm(ticker.symbol);
    handleSearch(null, ticker.symbol);
    setFilteredTickers([]);
  };

  const handleTrade = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const tradeData = {
      symbol: currentStock.symbol,
      shares: parseInt(sharesToTrade),
      tradeType: e.nativeEvent.submitter.className, // 'buy' or 'sell'
      orderType: tradeType, // 'market' or 'limit'
      limitPrice: limitPrice ? parseFloat(limitPrice) : null,
    };

    try {
      const response = await axios.post('/execute-trade', tradeData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        console.log('Trade successful!');
        console.log('Server response:', response.data);

        setPortfolioValue(response.data.portfolio_value);
        setUserData(prevData => ({
          ...prevData,
          portfolio: response.data.portfolio,
          portfolio_value: response.data.portfolio_value,
          uninvested_cash: response.data.uninvested_cash
        }));
        setInvestedCash(response.data.invested_cash);

        // Update the current stock data
        setCurrentStock(prevStock => ({
          ...prevStock,
          shares: response.data.portfolio.find(stock => stock.symbol === currentStock.symbol)?.quantity || 0
        }));

        // Clear the trade form
        setSharesToTrade(0);
        setLimitPrice('');

        // Fetch updated portfolio value history
        fetchPortfolioValueHistory();
      } else {
        console.error('Trade failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error executing trade:', error);
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    let greeting = '';

    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Good morning, ';
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = 'Good afternoon, ';
    } else {
      greeting = 'Good evening, ';
    }

    return greeting;
  };

  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    setIsAiLoading(true);
    try {
      const response = await axios.post('/ai-assistant', { input: (aiInput + ". Maximum 5 sentences. If ever asked to introduce yourself, introduce yourself as OroGenie AI.") }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiResponse(response.data.response);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setAiResponse('Sorry, there was an error processing your request.');
    } finally {
      setIsAiLoading(false);
    }
  };



  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      <nav className="navBar">
        <h1><Link to="/dashboard">OroGenie</Link></h1>
        <div className="nav-buttons">
          <button onClick={toggleDarkMode}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleEditMode}>
            <Edit size={20} />
          </button>
          <button onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </nav>

      <h1 className="greeting">
        {getGreeting() + userData?.first_name}
        <span id='cool-dot'>.</span>
      </h1>

      <div style={{ transform: `translateY(${-scrollPosition * 0.5}px)`, transition: 'transform 0.3s ease-out' }}>
        <div className="main-content">
          <div className="chart-info-container">
            <div className="chart-container">
              {(!currentStock || showPortfolioChart) ? (
                <div className="portfolio-chart">
                  <div className="section-header">Portfolio: ${(userData?.portfolio_value || 0).toFixed(2)}</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={portfolioHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <>
                  <div className="section-header">
                    <span>{currentStock.name}</span>
                    <span>${currentStock.price}</span>
                    <button onClick={toggleChartType} className="chart-toggle-btn">
                      {chartType === 'simple' ? (
                        <ChartCandlestick size={20} />
                      ) : (
                        <ChartSpline size={20} />
                      )}
                    </button>
                  </div>
                  {showChart && (
                    <div className="stock-chart">
                      <TradingViewWidget
                        symbol={currentStock.symbol}
                        darkMode={darkMode}
                        chartType={chartType}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="info-container">
              <div className="section-header">Stock Information</div>
              <div className="stock-details">
                <p>Symbol: {currentStock?.symbol}</p>
                <p>Price: ${currentStock?.price}</p>
                {/*<p>Shares Owned: {currentStock?.shares}</p>*/}
                {/* <p>Total Value: ${(currentStock?.shares * parseFloat(currentStock?.price || 0)).toFixed(2)}</p> */}
              </div>
            </div>
          </div>

          <div className="portfolioBar-transaction-container">
            <div className="portfolio-bar" onClick={handlePortfolioBarClick}>
              <div className="section-header">
                Portfolio: ${(portfolioValue || 0).toFixed(2)}
                <br />
                Uninvested Cash: ${(userData?.uninvested_cash || 0).toFixed(2)}
                <br />
                Invested Cash: ${investedCash.toFixed(2)}
              </div>
              <div className="stock-tiles-wrapper">
                {userData?.portfolio?.map(stock => (
                  <div
                    key={stock.symbol}
                    className="stock-tile"
                    data-symbol={stock.symbol}
                    data-change={stock.quantity * stock.current_price - stock.quantity * stock.purchase_price > 0 ? "positive" : stock.quantity * stock.current_price - stock.quantity * stock.purchase_price < 0 ? "negative" : ""}
                    onClick={() => handleSearch(null, stock.symbol)}
                  >
                    <p>{stock.symbol}</p>
                    <p>{stock.quantity} shares</p>
                    <p>Current Price: ${stock.current_price}</p>
                    <p>Total Value: ${(stock.quantity * stock.current_price).toFixed(2)}</p>
                    <p>Total Gain: ${((stock.quantity * stock.current_price) - (stock.quantity * stock.purchase_price)).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            <TransactionLog />
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="tile top-gainers">
            <div className="section-header">Top Gainers</div>
            <div className="stock-tiles-container">
              {topGainers.map(stock => (
                <div
                  key={stock.symbol}
                  className="stock-tile"
                  data-symbol={stock.symbol}
                  data-change="positive"
                  onClick={() => handleSearch(null, stock.symbol)}
                >
                  <p>{stock.symbol}</p>
                  <p>${gainersPrices[stock.symbol] || stock.price}</p>
                  <p>{stock.change}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="tile top-losers">
            <div className="section-header">Top Losers</div>
            <div className="stock-tiles-container">
              {topLosers.map(stock => (
                <div
                  key={stock.symbol}
                  className="stock-tile"
                  data-symbol={stock.symbol}
                  data-change="negative"
                  onClick={() => handleSearch(null, stock.symbol)}
                >
                  <p>{stock.symbol}</p>
                  <p>${losersPrices[stock.symbol] || stock.price}</p>
                  <p>{stock.change}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="tile ai-assistant">
            <div className="section-header">OroGenie AI </div>
            {aiResponse && (
              <div className="ai-response">
                {/* <h4>AI Response:</h4> */}
                <p>{aiResponse}</p>
              </div>
            )}
            <form onSubmit={handleAiSubmit}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask OroGenie..."
                disabled={isAiLoading}
              />
              <button type="submit" disabled={isAiLoading}>
                {isAiLoading ? 'Processing...' : 'Ask'}
              </button>
            </form>
          </div>

          <div className="tile algo-trading" id='algo-trading'>
            <div className="section-header">Algorithmic Trading</div>
            <CodeMirror
              value={code}
              height="150px"
              extensions={[python()]}
              theme={darkMode ? oneDark : 'none'}
              onChange={(value) => setCode(value)}
              placeholder="Write your Python code here..."
            />
            <button>
              Run Code
            </button>
          </div>
        </div>
      </div>

      <div className="sticky-bar">
        <div className="current-stock">
          <p>{currentStock.symbol}</p>
          {currentStock.price ? (
            <span>${currentStock.price}</span>
          ) : (
            <span>{getGreeting() + userData?.first_name}</span>
          )}
          {/* <p>${currentStock.price}</p> */}
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for stocks, company names, or symbols..."
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button type="submit">
            <Search size={25} />
          </button>
          {filteredTickers.length > 0 && (
            <div className="autocomplete-suggestions">
              {filteredTickers.map(ticker => (
                <div
                  key={ticker.symbol}
                  className="autocomplete-suggestion"
                  onClick={() => handleSuggestionClick(ticker)}
                >
                  {ticker.symbol} - {ticker.name}
                </div>
              ))}
            </div>
          )}
        </form>

        <form className="trade-form" onSubmit={handleTrade}>
          <div className="trade-options">
            <select value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
              <option value="market">Market Order</option>
              <option value="limit">Limit Order</option>
            </select>

            <input
              type="number"
              placeholder="Shares"
              value={sharesToTrade}
              onChange={(e) => setSharesToTrade(e.target.value)}
              min="1"
            />

            {tradeType === 'limit' && (
              <input
                type="number"
                placeholder="Limit Price"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            )}
          </div>

          <div className="buy-sell-buttons">
            <button type="submit" className="buy">Buy</button>
            <button type="submit" className="sell">Sell</button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Dashboard;
