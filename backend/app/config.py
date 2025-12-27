import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret_key')
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///site.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
    CORS_ALLOWED_ORIGINS = [origin if origin.startswith('http') else f'https://{origin}' for origin in cors_origins]
