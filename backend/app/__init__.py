from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from app.models import db  
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize extensions
socketio = SocketIO(cors_allowed_origins="http://localhost:3000")  # Allow CORS for WebSockets

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')  # Load secret key from environment variable
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  # Load JWT secret key
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')  # Load database URI

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
    JWTManager(app)
    socketio.init_app(app, cors_allowed_origins="*", async_mode='eventlet', transports=['polling'])

    # Register blueprints for HTTP routes
    from app.routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    # Register WebSocket routes
    from app.ws_routes import ws_bp
    app.register_blueprint(ws_bp)

    with app.app_context():
        db.create_all()

    return app
