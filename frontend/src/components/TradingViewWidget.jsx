import React, { useEffect, useRef, memo, useState } from 'react';

function TradingViewWidget({ symbol, darkMode, chartType }) {
  const container = useRef();
  const widgetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Don't render if no symbol provided
    if (!symbol) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Instead of modifying innerHTML directly, we use a nested div approach
    // to prevent React DOM conflicts with TradingView's script manipulations
    const timeoutId = setTimeout(() => {
      if (container.current) {
        // Remove the old widget container if it exists
        if (widgetRef.current && widgetRef.current.parentNode) {
          widgetRef.current.parentNode.removeChild(widgetRef.current);
        }

        // Create a new widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-inner';
        widgetContainer.style.height = '100%';
        widgetContainer.style.width = '100%';

        widgetRef.current = widgetContainer;
        container.current.appendChild(widgetContainer);

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;

        // Handle script load events
        script.onload = () => {
          setIsLoading(false);
        };

        script.onerror = () => {
          setIsLoading(false);
          setHasError(true);
        };

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

        widgetContainer.appendChild(script);

        // Set a timeout to hide loading after max wait time
        setTimeout(() => setIsLoading(false), 3000);
      }
    }, 100);

    // Cleanup function - don't manipulate React's DOM
    return () => {
      clearTimeout(timeoutId);
      // Only clean up the widget container we created, not React's container
      if (widgetRef.current && widgetRef.current.parentNode) {
        try {
          widgetRef.current.parentNode.removeChild(widgetRef.current);
        } catch (e) {
          // Ignore errors during cleanup
        }
        widgetRef.current = null;
      }
    };
  }, [symbol, darkMode, chartType]);

  // Show placeholder if no symbol
  if (!symbol) {
    return (
      <div className="tradingview-widget-container" style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        color: "var(--text-color)",
        opacity: 0.6
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
        <span style={{ fontSize: "14px" }}>Search for a stock to view chart</span>
      </div>
    );
  }

  return (
    <div className="tradingview-widget-container" style={{ height: "100%", width: "100%", position: "relative" }}>
      {isLoading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
          zIndex: 10
        }}>
          <div className="chart-loading-spinner"></div>
        </div>
      )}
      {hasError && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
          color: "var(--negative)"
        }}>
          <span>Failed to load chart</span>
          <span style={{ fontSize: "12px", opacity: 0.7 }}>Please try again</span>
        </div>
      )}
      {/* This ref container will hold the dynamically created TradingView widget */}
      <div ref={container} style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener noreferrer" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);