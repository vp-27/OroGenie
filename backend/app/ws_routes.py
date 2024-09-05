# ws_routes.py
from flask import Blueprint, request
from flask_socketio import emit, join_room, leave_room
from app import socketio

# Create a WebSocket blueprint
ws_bp = Blueprint('ws_bp', __name__)

# A dictionary to store connected users and their subscriptions (e.g., stock tickers)
connected_users = {}

@socketio.on('connect')
def handle_connect():
    emit('message', {'data': 'Connected to WebSocket server'})
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    user_id = request.sid  # Unique session ID for the user
    if user_id in connected_users:
        del connected_users[user_id]  # Remove the user from the connected users list
    print('Client disconnected')

@socketio.on('subscribe_to_stock')
def handle_subscribe_to_stock(data):
    user_id = request.sid  # Unique session ID for the user
    stock_ticker = data.get('ticker')

    # Add the user and their subscribed stock ticker to the dictionary
    if user_id in connected_users:
        connected_users[user_id].append(stock_ticker)
    else:
        connected_users[user_id] = [stock_ticker]

    join_room(stock_ticker)  # Join a room based on the stock ticker
    emit('message', {'data': f'Subscribed to {stock_ticker}'}, room=stock_ticker)

@socketio.on('unsubscribe_from_stock')
def handle_unsubscribe_from_stock(data):
    user_id = request.sid  # Unique session ID for the user
    stock_ticker = data.get('ticker')

    if user_id in connected_users and stock_ticker in connected_users[user_id]:
        connected_users[user_id].remove(stock_ticker)
        if not connected_users[user_id]:
            del connected_users[user_id]  # Remove user from dictionary if no subscriptions

    leave_room(stock_ticker)  # Leave the room based on the stock ticker
    emit('message', {'data': f'Unsubscribed from {stock_ticker}'}, room=stock_ticker)

def broadcast_stock_update(stock_ticker, price):
    """
    This function is called when there's a real-time update for a stock.
    It sends the updated price to all users subscribed to the stock.
    """
    emit('stock_update', {'ticker': stock_ticker, 'price': price}, room=stock_ticker)

# This is just an example function that would be called in your app when a stock price is updated
def update_stock_price(stock_ticker, new_price):
    print(f'Broadcasting new price for {stock_ticker}: {new_price}')
    broadcast_stock_update(stock_ticker, new_price)
