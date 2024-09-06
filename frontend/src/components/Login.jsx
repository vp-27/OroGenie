import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/forms.css';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/login', { email, password });
            if (response.data) {
                localStorage.setItem('token', response.data.token); // Assuming response.data.token contains the JWT
                setMessage('Login successful');
                navigate('/dashboard');
            } else {
                setMessage('Login failed, please try again');
            }
        } catch (error) {
            console.error(error);
            setMessage('Invalid credentials');
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
                        placeholder= " "
                        className="form-input"
                    />
                    <label className="form-label">Email</label>
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder= " "
                        className="form-input"
                    />
                    <label className="form-label">Password</label>
                </div>
                <button type="submit" className="form-button">Login</button>
                <p className="redirect-link">
                    Create an account 
                </p>
                <Link to="/register">Register</Link>
            </form>
            {message && <p className="form-message">{message}</p>}
        </div>
    );
}

export default Login;
