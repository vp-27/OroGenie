import bcrypt
from app.models import db, User
import jwt
import datetime

SECRET_KEY = 'your_jwt_secret_key'  # Replace with your actual secret key

def register_user(email, password, first_name, last_name, portfolio_value):
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        raise ValueError("User already exists")

    # Hash the password with bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create a new user with the provided data
    new_user = User(
        email=email,
        password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        portfolio_value=portfolio_value,
        uninvested_cash=portfolio_value,  # Set uninvested_cash to initial portfolio_value
        invested_cash=0.00                # Initialize invested_cash to 0
    )
    
    # Add and commit the new user to the database
    db.session.add(new_user)
    db.session.commit()
    
    return {'email': email, 'first_name': first_name, 'last_name': last_name}

def login_user(email, password):
    # Fetch the user by email
    user = User.query.filter_by(email=email).first()
    
    # Validate user credentials
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        raise ValueError("Invalid credentials")
    
    # Generate a JWT token for the user
    token = jwt.encode({
        'sub': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm='HS256')

    return token
