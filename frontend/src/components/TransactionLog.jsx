import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const TransactionLog = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/user-transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="transaction-card">
      <h3 className='section-header'>Transaction Log</h3>
      <table className='transaction-table'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Symbol</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{new Date(transaction.timestamp).toLocaleString()}</td>
              <td>{transaction.transaction_type}</td>
              <td>{transaction.symbol}</td>
              <td>{transaction.quantity}</td>
              <td>${transaction.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionLog;