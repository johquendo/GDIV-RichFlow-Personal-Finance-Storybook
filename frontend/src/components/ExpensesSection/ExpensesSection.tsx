import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../../utils/api';
import './ExpensesSection.css';

interface ExpenseItem {
  id: number;
  name: string;
  amount: number;
}

const ExpenseSection: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expensesAPI.getExpenses();
      setExpenses(response);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!name.trim() || !amount.trim()) return;

    try {
      setError(null);
      const response = await expensesAPI.addExpense(name, parseFloat(amount));
      setExpenses([...expenses, response]);
      setName('');
      setAmount('');
    } catch (err: any) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      setError(null);
      await expensesAPI.deleteExpense(id);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

  return (
    <div className="expense-container">
      <h1 className="expense-header">Expenses</h1>

      <div className="expense-card">
        {loading ? (
          <p>Loading expenses...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : !Array.isArray(expenses) ? (
          <p className="error-message">Error loading expenses</p>
        ) : expenses.length === 0 ? (
          <p className="expense-empty">No expenses added yet.</p>
        ) : (
          expenses.map((item) => (
            <div key={item.id} className="expense-item">
              <span>{item.name}</span>
              <span className="expense-amount">
                ${typeof item.amount === 'number' ? item.amount.toFixed(2) : '0.00'}
              </span>
              <button
                className="delete-btn"
                onClick={() => deleteExpense(item.id)}
              >
                ✕
              </button>
            </div>
          ))
        )}

        <div className="expense-inputs">
          <input
            type="text"
            placeholder="Expense name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button className="add-expense-btn" onClick={addExpense}>
          + Add Expense
        </button>
      </div>
    </div>
  );
};

export default ExpenseSection;
