# __init__.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from app.models import db  
# from flask_migrate import Migrate

# Initialize extensions
# db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="http://localhost:3000")# Allow CORS for WebSockets

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'  # Secret key for Flask application
    app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Secret key for JWTs
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'

    # Initialize extensions
    db.init_app(app)
    # migrate = Migrate(app, db)
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