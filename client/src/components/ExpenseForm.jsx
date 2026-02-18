import React, { useState, useEffect } from 'react';
import API from '../api';

const ExpenseForm = ({ onExpenseAdded, editItem, onCancelEdit }) => {
  const [type, setType] = useState('expense');
  const [isCustom, setIsCustom] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // 🔹 Effect to populate form when editing
  useEffect(() => {
    if (editItem) {
      setType(editItem.type || 'expense');
      setFormData({
        amount: editItem.amount?.$numberDecimal || editItem.amount,
        category: editItem.category,
        description: editItem.description,
        date: new Date(editItem.date).toISOString().split('T')[0]
      });
      setIsCustom(false);
    }
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editItem) {
        // Update existing transaction
        await API.post(`/expenses/${editItem._id}`, { ...formData, type });
        onCancelEdit();
      } else {
        // Create new transaction with idempotency key
        const idempotencyKey = crypto.randomUUID();
        await API.post('/expenses', { ...formData, type, idempotencyKey });
      }
      
      setFormData({ amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
      onExpenseAdded();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-6">
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 rounded-lg font-bold transition ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 rounded-lg font-bold transition ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="number" step="0.01" placeholder="Amount" 
          className="p-3 border rounded-lg outline-blue-500" required
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
        />

        {!isCustom ? (
          <select 
            className="p-3 border rounded-lg outline-blue-500" required
            value={formData.category}
            onChange={(e) => e.target.value === 'CUSTOM' ? setIsCustom(true) : setFormData({...formData, category: e.target.value})}
          >
            <option value="">Select Category</option>
            {type === 'expense' ? (
              <>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Rent">Rent</option>
              </>
            ) : (
              <option value="Salary">Salary</option>
            )}
            <option value="CUSTOM">+ Add Custom</option>
          </select>
        ) : (
          <input 
            type="text" placeholder="Custom Category" 
            className="p-3 border rounded-lg border-blue-500 outline-none" required
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          />
        )}

        <input 
          type="text" placeholder="Description" 
          className="p-3 border rounded-lg outline-blue-500" required
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
        <input 
          type="date" 
          className="p-3 border rounded-lg outline-blue-500" required
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
        />
      </div>

      <div className="flex gap-2 mt-6">
        <button 
          type="submit" disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Processing...' : editItem ? 'Update Entry' : `Add ${type}`}
        </button>
        {editItem && (
          <button 
            type="button" onClick={onCancelEdit}
            className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;