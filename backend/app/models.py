from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import NUMERIC

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    first_name = db.Column(db.String(150), nullable=False)
    last_name = db.Column(db.String(150), nullable=False)
    password = db.Column(db.String(150), nullable=False)
    portfolio_value = db.Column(db.Float, nullable=False, default=100000.00)
    uninvested_cash = db.Column(db.Float, nullable=False, default=100000.00)
    invested_cash = db.Column(db.Float, nullable=False, default=0.00)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationship to Transaction
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    holdings = db.relationship('UserHolding', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    symbol = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(NUMERIC(precision=10, scale=2), nullable=False)  # Use NUMERIC for precise monetary values
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<Transaction {self.id} {self.transaction_type} {self.symbol} {self.quantity}>'

class UserHolding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    symbol = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    purchase_price = db.Column(NUMERIC(precision=10, scale=2), nullable=False, default=0.00)

    def __repr__(self):
        return f'<UserHolding {self.user_id} {self.symbol} {self.quantity}>'
