// Register.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/forms.css';
// import blackGoldSilk from '../images/black-gold-silk.jpeg';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [portfolioValue, setPortfolioValue] = useState(100000);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const popupRef = useRef(null);
  let navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        portfolio_value: portfolioValue
      });
      setMessage('User registered successfully');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      setMessage('Error registering user, check password requirements');
    }
  };

  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handlePasswordFocus = () => {
    setShowPasswordPopup(true);
  };

  const handlePasswordBlur = (e) => {
    if (!popupRef.current.contains(e.relatedTarget)) {
      setShowPasswordPopup(false);
    }
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'red';
    if (passwordStrength <= 4) return '#f0cb51';
    return 'green';
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[\W]/.test(password)) strength++;
    return strength;
  };

  return (
    <div className="form-container">
      <div className="form-content">
        <form onSubmit={handleSubmit} className="form">
          <h2 className="form-heading">Register</h2>
          <div className="name-fields">
            <div className="input-group">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">First Name</label>
            </div>
            <div className="input-group">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">Last Name</label>
            </div>
          </div>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
              className="form-input"
            />
            <label className="form-label">Email</label>
          </div>
          <div className="input-group password-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              required
              placeholder=" "
              className="form-input"
            />
            <label className="form-label">Password</label>
            {showPasswordPopup && (
              <div className="password-popup" ref={popupRef}>
                <h4>Password Requirements:</h4>
                <ul>
                  <li>At least 8 characters long</li>
                  <li>Contains at least 3 of the following:</li>
                  <ul>
                    <li>Lowercase letter</li>
                    <li>Uppercase letter</li>
                    <li>Digit</li>
                    <li>Special character</li>
                  </ul>
                </ul>
                <div className="password-strength">
                  <div 
                    className="strength-bar" 
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="input-group">
            <label className="range-label">Portfolio Value</label>
            {isEditing ? (
              <input
                type="number"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(e.target.value)}
                onBlur={handleBlur}
                className="form-input"
              />
            ) : (
              <>
                <input
                  type="range"
                  min={100000}
                  max={1000000}
                  step={5000}
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(e.target.value)}
                  className="range-style"
                />
                <div className="range-value" onDoubleClick={handleDoubleClick}>${portfolioValue}</div>
              </>
            )}
          </div>
          <button type="submit" className="form-button">Register</button>
          <p className="redirect-link">Already have an account?</p>
          <Link to="/login">Login Here!</Link>
        </form>
        {message && <p className="form-message">{message}</p>}
      </div>
    </div>
  );
}

export default Register;
