import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';
import AnimatedGreeting from '../utils/AnimatedGreeting';

const LandingPage = () => {
    return (
        <div className='landing-page'>
            <div className="container">
                <header>
                    <h1><Link to="/">OroGenie</Link></h1>
                    <nav>
                        <ul>
                            <li><Link to="/register" className="nav-link">Sign Up</Link></li>
                            <li><Link to="/login" className="nav-link">Login</Link></li>
                            <li><Link to="/about" className="nav-link">About</Link></li>
                        </ul>
                    </nav>
                </header>
                <main className="hero full-screen">
                    <div className="hero-content">
                        <AnimatedGreeting />
                        <p style={{ padding: '5px' }}>Simple yet powerful trading platform</p>
                        <a href="/register" className="cta-button">Get Started</a>
                    </div>
                    <div className="golden-ball"></div>
                </main>
                <section className="features">
                    <div className="feature">
                        <i className="fas fa-chart-line"></i>
                        <h3>Real-time Analytics</h3>
                        <p>Stay ahead with our cutting-edge market analysis tools</p>
                    </div>
                    <div className="feature">
                        <i className="fas fa-shield-alt"></i>
                        <h3>Beginner Friendly</h3>
                        <p>Combining the art of easy UI with powerful tools to bring the power to the user of any experience level</p>
                    </div>
                    <div className="feature">
                        <i className="fas fa-users"></i>
                        <h3>Live Trading</h3>
                        <p>Watch your paper portfolio grow as you test your trades</p>
                    </div>
                </section>
                <section className="advertising parallax parallax-algo">
                    <h2>Algorithmic Trading</h2>
                    <p>Leverage AI-powered trading algorithms to maximize your returns.</p>
                </section>
                <section className="advertising parallax parallax-ai">
                    <h2>OroGenie AI Assistant</h2>
                    <p>Get real-time advice and insights from our AI trading assistant.</p>
                </section>
                <section className="advertising parallax parallax-data">
                    <h2>Real-Time Stock Data</h2>
                    <p>Stay updated with the latest stock prices, refreshed in real-time.</p>
                </section>
                <section className="advertising parallax parallax-community">
                    <h2>Join the Community</h2>
                    <p>Connect with other traders, share insights, and grow together.</p>
                </section>
            </div>
            <footer>
                <p>&copy; 2024 OroGenie. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
