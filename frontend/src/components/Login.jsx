import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/forms.css';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isLoading, setIsLoading] = useState(false);

    const getErrorMessage = (error) => {
        // Handle network errors
        if (!error.response) {
            return 'Unable to connect to server. Please check your internet connection.';
        }

        const status = error.response.status;
        const backendMessage = error.response.data?.message;

        switch (status) {
            case 401:
                return backendMessage || 'Invalid email or password. Please try again.';
            case 400:
                return backendMessage || 'Invalid email format. Please check your email.';
            case 500:
                return 'Server error. Please try again later.';
            default:
                return backendMessage || 'Login failed. Please try again.';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        setMessageType('');

        try {
            const response = await axios.post('/login', { email, password });
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
                setMessage('Login successful! Redirecting...');
                setMessageType('success');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 500);
            } else {
                setMessage('Login failed. Please try again.');
                setMessageType('error');
            }
        } catch (error) {
            console.error(error);
            setMessage(getErrorMessage(error));
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="form">
                <h2 className="form-heading">Login</h2>
                <div className="input-group">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder=" "
                        className={`form-input ${messageType === 'error' ? 'input-error' : ''}`}
                        disabled={isLoading}
                    />
                    <label className="form-label">Email</label>
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder=" "
                        className={`form-input ${messageType === 'error' ? 'input-error' : ''}`}
                        disabled={isLoading}
                    />
                    <label className="form-label">Password</label>
                </div>
                <button
                    type="submit"
                    className={`form-button ${isLoading ? 'button-loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="button-content">
                            <span className="spinner"></span>
                            Logging in...
                        </span>
                    ) : (
                        'Login'
                    )}
                </button>
                {message && (
                    <p className={`form-message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
                        {message}
                    </p>
                )}
                <p className="redirect-link">
                    Create an account
                </p>
                <Link to="/register">Register</Link>
            </form>
        </div>
    );
}

export default Login;
