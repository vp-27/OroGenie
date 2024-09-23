import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol, darkMode, chartType }) {
  const container = useRef();

  useEffect(() => {
    const currentContainer = container.current; // Capture the current value of the ref

    const timeoutId = setTimeout(() => {
      if (currentContainer) {
        // Clear any existing content in the container
        currentContainer.innerHTML = '';

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;

        // Choose script source based on chart type
        if (chartType === 'simple') {
          script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
          script.textContent = JSON.stringify({
            "symbols": [[symbol]],
            "chartOnly": false,
            "width": "100%",
            "height": "100%",
            "locale": "en",
            "backgroundColor": "rgba(0, 0, 0, 0)",
            "colorTheme": darkMode ? "dark" : "light",
            "autosize": true,
            "showVolume": true,
            "showMA": false,
            "hideDateRanges": false,
            "hideMarketStatus": false,
            "hideSymbolLogo": false,
            "scalePosition": "right",
            "scaleMode": "Normal",
            "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
            "fontSize": "10",
            "noTimeScale": false,
            "valuesTracking": "1",
            "changeMode": "price-and-percent",
            "chartType": "area",
            "lineWidth": 2,
            "lineType": 0,
            "dateRanges": [
              "1d|1",
              "1m|30",
              "3m|60",
              "12m|1D",
              "60m|1W",
              "all|1M"
            ]
          });
        } else {
          script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
          script.textContent = JSON.stringify({
            "autosize": true,
            "symbol": `${symbol}`,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": darkMode ? "dark" : "light",
            "style": "1",
            "locale": "en",
            "allow_symbol_change": true,
            "calendar": false,
            "support_host": "https://www.tradingview.com"
          });
        }

        currentContainer.appendChild(script);
      }
    }, 100); // Add a 100ms delay to ensure DOM readiness

    return () => {
      clearTimeout(timeoutId); // Clean up the timeout on unmount
      if (currentContainer) {
        currentContainer.innerHTML = ''; // Clear the container using the captured ref
      }
    };
  }, [symbol, darkMode, chartType]); // Ensure all relevant dependencies are included

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener noreferrer" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);