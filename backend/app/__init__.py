from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from app.models import db
from app.config import Config

# Initialize extensions
socketio = SocketIO()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS for HTTP routes
    CORS(app, resources={r"/*": {"origins": app.config['CORS_ALLOWED_ORIGINS']}})
    
    JWTManager(app)
    
    # Configure SocketIO with CORS from config
    socketio.init_app(app, 
                      cors_allowed_origins=app.config['CORS_ALLOWED_ORIGINS'], 
                      async_mode='eventlet', 
                      transports=['polling', 'websocket'])

    # Register blueprints for HTTP routes
    from app.routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    # Register WebSocket routes
    from app.ws_routes import ws_bp
    app.register_blueprint(ws_bp)

    with app.app_context():
        db.create_all()

    return app
