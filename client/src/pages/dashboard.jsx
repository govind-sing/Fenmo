import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChartBar, List, Wallet, Search, Trash2, X } from 'lucide-react';
import API from '../api';
import ExpenseForm from '../components/ExpenseForm';
import Analysis from '../components/Analysis';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list');
  const [editItem, setEditItem] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Delete confirmation – now per transaction
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmRef = useRef(null);

  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      navigate('/auth?mode=login');
    }
  }, [navigate]);

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      const { data } = await API.get('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchExpenses();
  }, [fetchExpenses, user]);

  // Close confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (confirmingDeleteId && confirmRef.current && !confirmRef.current.contains(event.target)) {
        setConfirmingDeleteId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [confirmingDeleteId]);

  const parseAmount = (amt) => {
    return parseFloat(amt?.$numberDecimal || amt || 0);
  };

  const netBalance = expenses.reduce((acc, curr) => {
    const val = parseAmount(curr.amount);
    return curr.type === 'income' ? acc + val : acc - val;
  }, 0);

  const startDelete = (id) => {
    setConfirmingDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmingDeleteId(null);
  };

  const performDelete = async (id) => {
    setIsDeleting(true);
    try {
      await API.delete(`/expenses/${id}`);
      setConfirmingDeleteId(null);
      fetchExpenses();
    } catch (err) {
      console.error('Delete failed:', err);
      // You could add error feedback here later (toast/snackbar)
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/auth?mode=login');
  };

  const displayedExpenses = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateB - dateA !== 0) return dateB - dateA;

      const idA = a._id || '';
      const idB = b._id || '';
      return idB.localeCompare(idA);
    });

    if (!searchQuery.trim()) return sorted;

    const query = searchQuery.toLowerCase().trim();

    return sorted.filter((exp) => {
      const description = (exp.description || '').toLowerCase();
      const category = (exp.category || '').toLowerCase();
      const type = (exp.type || 'expense').toLowerCase();
      return (
        description.includes(query) ||
        category.includes(query) ||
        type.includes(query)
      );
    });
  }, [expenses, searchQuery]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10 border-b">
        <div className="flex items-center gap-2">
          <Wallet className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold text-gray-800">Fenmo Finance</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-4 border-r pr-4 border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
              {user.name?.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700">Hi, {user.name}</span>
          </div>

          <button
            onClick={() => setView(view === 'list' ? 'analysis' : 'list')}
            className="flex items-center gap-2 text-blue-600 font-semibold text-sm bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
          >
            {view === 'list' ? (
              <>
                <ChartBar size={18} /> Analysis
              </>
            ) : (
              <>
                <List size={18} /> List View
              </>
            )}
          </button>

          <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition ml-2">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-8 p-6">
        {view === 'analysis' ? (
          <Analysis transactions={expenses} />
        ) : (
          <div className="space-y-6">
            <ExpenseForm
              onExpenseAdded={fetchExpenses}
              editItem={editItem}
              onCancelEdit={() => setEditItem(null)}
            />

            {/* Search + Balance */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search description, category, income/expense..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-center sm:text-right shrink-0">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Total Balance
                </p>
                <div
                  className={`text-2xl font-black ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {netBalance < 0 ? '-' : ''}₹{Math.abs(netBalance).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold">Details</th>
                    <th className="p-4 font-bold">Type</th>
                    <th className="p-4 text-right font-bold">Amount</th>
                    <th className="p-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isInitialLoading ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-400">
                        Loading transactions...
                      </td>
                    </tr>
                  ) : displayedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-400 italic">
                        {searchQuery
                          ? "No matching transactions found."
                          : "No transactions yet. Add your first one!"}
                      </td>
                    </tr>
                  ) : (
                    displayedExpenses.map((exp) => {
                      const isConfirming = confirmingDeleteId === exp._id;

                      return (
                        <tr
                          key={exp._id}
                          className={`hover:bg-gray-50 transition border-b last:border-0 ${
                            isConfirming ? 'bg-red-50' : ''
                          }`}
                        >
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(exp.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{exp.description}</div>
                            <div className="text-xs text-blue-500 font-medium">{exp.category}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                exp.type === 'income'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {exp.type || 'expense'}
                            </span>
                          </td>
                          <td
                            className={`p-4 text-right font-black ${
                              exp.type === 'income' ? 'text-green-600' : 'text-gray-900'
                            }`}
                          >
                            ₹{parseAmount(exp.amount).toFixed(2)}
                          </td>
                          <td className="p-4 text-center">
                            {isConfirming ? (
                              <div
                                ref={confirmRef}
                                className="inline-flex items-center gap-3 bg-white border border-red-300 rounded px-3 py-1.5 shadow-sm text-sm"
                              >
                                <span className="text-red-700 font-medium whitespace-nowrap">
                                  Delete?
                                </span>
                                <button
                                  onClick={() => performDelete(exp._id)}
                                  disabled={isDeleting}
                                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-medium"
                                >
                                  {isDeleting ? 'Deleting...' : 'Yes'}
                                </button>
                                <button
                                  onClick={cancelDelete}
                                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="space-x-3">
                                <button
                                  onClick={() => {
                                    setEditItem(exp);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="text-blue-500 hover:text-blue-700 text-xs font-bold underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => startDelete(exp._id)}
                                  className="text-red-500 hover:text-red-700 text-xs font-bold underline"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;