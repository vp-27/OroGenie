from flask import Blueprint, request, jsonify
from app.services.auth_service import register_user, login_user
from app.utils.validators import is_valid_email, is_valid_password
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Transaction, UserHolding, db
import jwt
from app.scraper.stock_scraper import StockScraper
import requests
import json
import os

from sqlalchemy import func

import logging


from datetime import datetime, time #, timedelta
import pytz

from flask_jwt_extended import decode_token

bp = Blueprint('routes', __name__)

# Instantiate the StockScraper with a list of stock tickers
stock_scraper = StockScraper(stock_tickers=['MSFT', 'TSLA', 'NVDA'])

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    portfolio_value = data.get('portfolio_value')

    if not is_valid_email(email):
        return jsonify(message="Invalid email address"), 400
    if not is_valid_password(password):
        return jsonify(message="Password does not meet requirements"), 400

    try:
        user = register_user(email, password, first_name, last_name, portfolio_value)
        return jsonify(message="User registered successfully", user=user), 201
    except Exception as e:
        return jsonify(message=str(e)), 400

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not is_valid_email(email):
        return jsonify(message="Invalid email address"), 400

    try:
        token = login_user(email, password)
        return jsonify(message="Login successful", token=token), 200
    except Exception as e:
        return jsonify(message=str(e)), 401

@bp.route('/user-data', methods=['GET'])
def user_data():
    # Handle GET request
    token = request.headers.get('Authorization')
    if not token:
        return jsonify(message="Token is missing"), 401

    try:
        token = token.replace("Bearer ", "")
        decoded = jwt.decode(token, 'your_jwt_secret_key', algorithms=['HS256'])
        email = decoded['sub']
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify(message="User not found"), 404

        return jsonify(email=user.email, first_name=user.first_name, last_name=user.last_name, portfolio_value=user.portfolio_value), 200
    except jwt.ExpiredSignatureError:
        return jsonify(message="Token has expired"), 401
    except jwt.InvalidTokenError:
        return jsonify(message="Invalid token"), 401

@bp.route('/get-stock-price', methods=['POST'])
def get_stock_price_route():
    ticker = request.json.get('ticker')
    ticker = ticker.upper()
    if not ticker:
        return jsonify({"error": "No ticker provided"}), 400

    price = stock_scraper.get_stock_price(ticker)
    if price:
        return jsonify({"ticker": ticker, "price": price})
    else:
        return jsonify({"error": "Could not fetch stock price"}), 500
    

def get_rank_type():
    utc = pytz.utc
    current_time = datetime.now(utc).time()

    pre_market_end = time(13, 30)  # 09:30 AM ET in UTC
    market_close = time(20, 0)     # 04:00 PM ET in UTC

    if current_time < pre_market_end:
        return "preMarket"
    elif current_time > market_close:
        return "afterMarket"
    else:
        return "1d"

@bp.route('/top-gainers', methods=['GET'])
def get_top_gainers():
    rank_type = get_rank_type()
    print("Rank type:", rank_type)
    
    response = requests.get(f"https://quotes-gw.webullfintech.com/api/wlas/ranking/topGainers?regionId=6&rankType={rank_type}&pageIndex=1&pageSize=50")
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to fetch top gainers"}), 500

@bp.route('/top-losers', methods=['GET'])
def get_top_losers():
    rank_type = get_rank_type()
    print("Rank type:", rank_type)
    
    response = requests.get(f"https://quotes-gw.webullfintech.com/api/wlas/ranking/dropGainers?regionId=6&rankType={rank_type}&pageIndex=1&pageSize=50")
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to fetch top losers"}), 500
    
@bp.route('/fetch-tickers', methods=['GET'])
def fetch_tickers():
    file_path = os.path.join('/Users/machanic/Documents/vpStudios/underground_coding/reactive_OroGenie/OroGenie/backend/app/utils/', 'company_tickers.json')
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        print(f'Error reading file: {e}')
        return jsonify({'error': 'Failed to fetch data'}), 500
    
@bp.route('/portfolio-value-history', methods=['GET'])
@jwt_required()
def get_portfolio_value_history():
    email = get_jwt_identity()
    current_user = User.query.filter_by(email=email).first()

    if current_user is None:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    # Get all transactions for the user
    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.timestamp).all()

    portfolio_value = current_user.uninvested_cash + current_user.invested_cash
    portfolio_history = [{'timestamp': current_user.created_at, 'value': portfolio_value}]

    for transaction in transactions:
        if transaction.transaction_type == 'buy':
            portfolio_value -= transaction.quantity * float(transaction.price)
        else:  # sell
            portfolio_value += transaction.quantity * float(transaction.price)
        
        portfolio_history.append({'timestamp': transaction.timestamp, 'value': portfolio_value})

    return jsonify({'success': True, 'portfolio_history': portfolio_history})

@bp.route('/update-portfolio-value', methods=['GET'])
@jwt_required()
def update_portfolio_value():
    email = get_jwt_identity()
    current_user = User.query.filter_by(email=email).first()

    if current_user is None:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    holdings = UserHolding.query.filter_by(user_id=current_user.id).all()
    
    total_value = current_user.uninvested_cash

    for holding in holdings:
        current_price = stock_scraper.get_stock_price(holding.symbol)
        if current_price:
            total_value += float(current_price) * holding.quantity

    current_user.portfolio_value = total_value
    db.session.commit()

    return jsonify({'success': True, 'portfolio_value': total_value})

@bp.route('/execute-trade', methods=['POST'])
@jwt_required()
def execute_trade():
    email = get_jwt_identity()
    current_user = User.query.filter_by(email=email).first()

    if current_user is None:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    data = request.get_json()
    symbol = data['symbol'].upper()
    shares = int(data['shares'])
    trade_type = data['tradeType']  # 'buy' or 'sell'
    order_type = data['orderType']  # 'market' or 'limit'
    limit_price = data.get('limitPrice')

    current_price = stock_scraper.get_stock_price(symbol)
    if current_price is None:
        return jsonify({'success': False, 'message': 'Failed to fetch current stock price'}), 500

    current_price = float(current_price)

    if order_type == 'limit' and limit_price is not None:
        limit_price = float(limit_price)
        if (trade_type == 'buy' and limit_price < current_price) or (trade_type == 'sell' and limit_price > current_price):
            return jsonify({'success': False, 'message': 'Limit order not executed due to price conditions'}), 400

    total_trade_value = shares * current_price
    
    if trade_type == 'buy':
        if current_user.uninvested_cash >= total_trade_value:
            current_user.uninvested_cash -= total_trade_value
            current_user.invested_cash += total_trade_value
            holding = UserHolding.query.filter_by(user_id=current_user.id, symbol=symbol).first()
            if holding:
                holding.quantity += shares
                holding.purchase_price = ((holding.quantity - shares) * float(holding.purchase_price) + total_trade_value) / holding.quantity
            else:
                new_holding = UserHolding(user_id=current_user.id, symbol=symbol, quantity=shares, purchase_price=current_price)
                db.session.add(new_holding)
        else:
            return jsonify({'success': False, 'message': 'Insufficient funds'}), 400
    elif trade_type == 'sell':
        holding = UserHolding.query.filter_by(user_id=current_user.id, symbol=symbol).first()
        if holding and holding.quantity >= shares:
            current_user.uninvested_cash += total_trade_value
            invested_cash_to_deduct = holding.purchase_price * shares  # Deduct the exact amount that was invested in these shares
            current_user.invested_cash -= float(invested_cash_to_deduct)
            holding.quantity -= shares
            if holding.quantity == 0:
                db.session.delete(holding)
        else:
            return jsonify({'success': False, 'message': 'Insufficient shares'}), 400

    new_transaction = Transaction(
        user_id=current_user.id,
        transaction_type=trade_type,
        symbol=symbol,
        quantity=shares,
        price=current_price
    )
    db.session.add(new_transaction)

    # Update portfolio value
    holdings = UserHolding.query.filter_by(user_id=current_user.id).all()
    total_value = current_user.uninvested_cash
    for holding in holdings:
        holding_price = stock_scraper.get_stock_price(holding.symbol)
        if holding_price:
            total_value += float(holding_price) * holding.quantity

    current_user.portfolio_value = total_value

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error during commit: {str(e)}")
        return jsonify({'success': False, 'message': 'Database error occurred'}), 500

    holdings = UserHolding.query.filter_by(user_id=current_user.id).all()
    holdings_data = [{
        'symbol': h.symbol,
        'quantity': h.quantity,
        'purchase_price': float(h.purchase_price),
        'current_price': float(stock_scraper.get_stock_price(h.symbol))
    } for h in holdings]

    return jsonify({
        'success': True, 
        'portfolio': holdings_data, 
        'portfolio_value': total_value,
        'uninvested_cash': current_user.uninvested_cash,
        'invested_cash': current_user.invested_cash
    })


@bp.route('/user-portfolio', methods=['GET'])
@jwt_required()
def get_user_portfolio():
    email = get_jwt_identity()
    current_user = User.query.filter_by(email=email).first()

    if current_user is None:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    holdings = UserHolding.query.filter_by(user_id=current_user.id).all()
    holdings_data = [{
        'symbol': h.symbol,
        'quantity': h.quantity,
        'purchase_price': float(h.purchase_price),
        'current_price': float(stock_scraper.get_stock_price(h.symbol))
    } for h in holdings]

    return jsonify({
        'success': True,
        'portfolio': holdings_data,
        'portfolio_value': current_user.portfolio_value,
        'uninvested_cash': current_user.uninvested_cash,
        'invested_cash': current_user.invested_cash
    })

@bp.route('/user-transactions', methods=['GET'])
@jwt_required()
def get_user_transactions():
    email = get_jwt_identity()
    current_user = User.query.filter_by(email=email).first()

    if current_user is None:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.timestamp.desc()).limit(20).all()
    
    transactions_data = [{
        'timestamp': t.timestamp,
        'transaction_type': t.transaction_type,
        'symbol': t.symbol,
        'quantity': t.quantity,
        'price': float(t.price)
    } for t in transactions]

    return jsonify({
        'success': True,
        'transactions': transactions_data
    })

OPENROUTER_API_KEY = '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'
# YOUR_SITE_URL = os.environ.get('YOUR_SITE_URL')
# YOUR_APP_NAME = os.environ.get('YOUR_APP_NAME')

@bp.route('/ai-assistant', methods=['POST'])
@jwt_required()
def ai_assistant():
    data = request.get_json()
    user_input = data.get('input')

    if not user_input:
        return jsonify({'error': 'No input provided'}), 400

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                # "HTTP-Referer": YOUR_SITE_URL,
                # "X-Title": YOUR_APP_NAME,
            },
            json={
                "model": "meta-llama/llama-3.1-8b-instruct:free",
                "messages": [
                    {"role": "user", "content": user_input}
                ]
            }
        )
        
        response.raise_for_status()
        ai_response = response.json()['choices'][0]['message']['content']
        return jsonify({'response': ai_response})

    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500