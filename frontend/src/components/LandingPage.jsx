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
                            <li><Link to="/dashboard" className="nav-link">Dashboard UI Demo</Link></li>
                            {/* <li><Link to="/about" className="nav-link">About</Link></li> */}
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
                <section className="video">
                    <div className="video-content">
                        <iframe width="1022" height="604" src="https://www.youtube.com/embed/BfEcLruyksE" title="Introducing OroGenie - Trading Dashboard Redefined!" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        <h2>See OroGenie in Action</h2>
                        <a href="https://www.youtube.com/watch?v=7dJ4gZuZvQc" className="cta-button">Watch Now</a>
                    </div>
                </section>
            </div>
            <footer>
                <p>&copy; 2024 OroGenie. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
