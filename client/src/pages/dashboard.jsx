import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BarChart2, List, Search, Trash2, X, Edit2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, IndianRupee } from 'lucide-react';
import API from '../api';
import ExpenseForm from '../components/ExpenseForm';
import Analysis from '../components/Analysis';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const Dashboard = () => {
  const userRef = useRef(null);
  if (!userRef.current) {
    const stored = localStorage.getItem('userInfo');
    userRef.current = stored ? JSON.parse(stored) : null;
  }
  const user = userRef.current;

  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list');
  const [editItem, setEditItem] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const confirmRef = useRef(null);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  const goToPrevMonth = () =>
    setActiveMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );

  const goToNextMonth = () =>
    setActiveMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return activeMonth.year === now.getFullYear() && activeMonth.month === now.getMonth();
  }, [activeMonth]);

  useEffect(() => {
    if (!user) navigate('/auth?mode=login');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!user) return;
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (confirmingDeleteId && confirmRef.current && !confirmRef.current.contains(event.target)) {
        setConfirmingDeleteId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [confirmingDeleteId]);

  const parseAmount = (amt) => parseFloat(amt?.$numberDecimal || amt || 0);

  // ── Overall balance across ALL time ──
  const overallBalance = useMemo(() => {
    return expenses.reduce((acc, e) => {
      const val = parseAmount(e.amount);
      return e.type === 'income' ? acc + val : acc - val;
    }, 0);
  }, [expenses]);

  // ── Month-scoped figures ──
  const monthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === activeMonth.year && d.getMonth() === activeMonth.month;
    });
  }, [expenses, activeMonth]);

  const totalIncome = useMemo(() =>
    monthExpenses.filter(e => e.type === 'income').reduce((s, e) => s + parseAmount(e.amount), 0),
    [monthExpenses]
  );
  const totalExpense = useMemo(() =>
    monthExpenses.filter(e => e.type !== 'income').reduce((s, e) => s + parseAmount(e.amount), 0),
    [monthExpenses]
  );
  const netBalance = totalIncome - totalExpense;

  const performDelete = async (id) => {
    setIsDeleting(true);
    try {
      await API.delete(`/expenses/${id}`);
      setConfirmingDeleteId(null);
      fetchExpenses();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/auth?mode=login');
  };

  const displayedExpenses = useMemo(() => {
    const sorted = [...monthExpenses].sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (diff !== 0) return diff;
      return (b._id || '').localeCompare(a._id || '');
    });
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase().trim();
    return sorted.filter(e =>
      (e.description || '').toLowerCase().includes(q) ||
      (e.category || '').toLowerCase().includes(q) ||
      (e.type || 'expense').toLowerCase().includes(q)
    );
  }, [monthExpenses, searchQuery]);

  if (!user) return null;

  const isPositive = overallBalance >= 0;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F7F6F3]">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#E8E5DF] px-6 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1A1A2E] rounded-md flex items-center justify-center">
            <IndianRupee size={14} className="text-[#E8C547]" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-sm font-medium tracking-tight text-[#1A1A2E]">
            fenmo<span className="text-[#E8C547]">.</span>finance
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-[#666] border-r border-[#E8E5DF] pr-3 mr-1">
            <div className="w-6 h-6 rounded-full bg-[#1A1A2E] text-[#E8C547] text-[10px] font-bold flex items-center justify-center uppercase">
              {user.name?.charAt(0)}
            </div>
            <span className="font-medium text-[#333]">{user.name}</span>
          </div>

          <button
            onClick={() => setView(v => v === 'list' ? 'analysis' : 'list')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border transition-all duration-200"
            style={view === 'analysis'
              ? { background: '#1A1A2E', color: '#E8C547', border: '1px solid #1A1A2E' }
              : { background: 'white', color: '#1A1A2E', border: '1px solid #D5D1C8' }
            }
          >
            {view === 'list' ? <><BarChart2 size={14} /> Analysis</> : <><List size={14} /> List View</>}
          </button>

          <button onClick={handleLogout} className="text-[#BBB] hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* ── Overall Balance Banner ── */}
      {!isInitialLoading && (
        <div
          className="w-full px-6 py-3 flex items-center justify-between"
          style={{
            background: isPositive
              ? 'linear-gradient(90deg, #052e16 0%, #14532d 100%)'
              : 'linear-gradient(90deg, #450a0a 0%, #7f1d1d 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            {isPositive
              ? <TrendingUp size={15} className="text-green-300" />
              : <TrendingDown size={15} className="text-red-300" />
            }
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: isPositive ? '#86efac' : '#fca5a5' }}>
              Overall Balance
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
              style={{
                background: isPositive ? 'rgba(134,239,172,0.15)' : 'rgba(252,165,165,0.15)',
                color: isPositive ? '#86efac' : '#fca5a5',
                border: `1px solid ${isPositive ? 'rgba(134,239,172,0.3)' : 'rgba(252,165,165,0.3)'}`,
              }}
            >
              All time
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              style={{ fontFamily: "'DM Mono', monospace", color: isPositive ? '#4ade80' : '#f87171' }}
              className="text-lg font-bold tracking-tight"
            >
              {isPositive ? '+' : '-'}₹{Math.abs(overallBalance).toFixed(2)}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isPositive ? '#166534' : '#991b1b',
                color: isPositive ? '#bbf7d0' : '#fecaca',
              }}
            >
              {isPositive ? '▲ Surplus' : '▼ Deficit'}
            </span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {view === 'analysis' ? (
          <Analysis transactions={expenses} />
        ) : (
          <>
            {/* ── Month Navigator ── */}
            <div className="flex items-center justify-between bg-white border border-[#E8E5DF] rounded-xl px-5 py-3">
              <button
                onClick={goToPrevMonth}
                className="flex items-center gap-1 text-sm font-medium text-[#555] hover:text-[#1A1A2E] hover:bg-[#F7F6F3] px-3 py-1.5 rounded-lg transition-all"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">
                  {MONTH_NAMES[(activeMonth.month + 11) % 12].slice(0, 3)}
                </span>
              </button>

              <div className="text-center">
                <div className="text-base font-bold text-[#1A1A2E]">
                  {MONTH_NAMES[activeMonth.month]} {activeMonth.year}
                </div>
                {isCurrentMonth && (
                  <div className="text-[10px] font-semibold text-[#E8C547] bg-[#1A1A2E] px-2 py-0.5 rounded-full mt-0.5 inline-block tracking-wider uppercase">
                    Current
                  </div>
                )}
              </div>

              <button
                onClick={goToNextMonth}
                disabled={isCurrentMonth}
                className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[#555] hover:text-[#1A1A2E] hover:bg-[#F7F6F3] disabled:hover:bg-transparent"
              >
                <span className="hidden sm:inline">
                  {MONTH_NAMES[(activeMonth.month + 1) % 12].slice(0, 3)}
                </span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* ── Month Summary Cards ── */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Income', value: totalIncome, icon: <TrendingUp size={16} />, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', sign: '+' },
                { label: 'Expenses', value: totalExpense, icon: <TrendingDown size={16} />, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', sign: '-' },
                { label: 'Net Balance', value: Math.abs(netBalance), icon: <IndianRupee size={16} />, color: netBalance >= 0 ? '#1A1A2E' : '#DC2626', bg: netBalance >= 0 ? '#FEFCE8' : '#FEF2F2', border: netBalance >= 0 ? '#FDE68A' : '#FECACA', sign: netBalance < 0 ? '-' : '', bold: true },
              ].map((card) => (
                <div key={card.label} className="rounded-xl p-4 border" style={{ background: card.bg, borderColor: card.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: card.color }}>{card.label}</span>
                    <span style={{ color: card.color }}>{card.icon}</span>
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", color: card.color }} className={`text-xl ${card.bold ? 'font-bold' : 'font-medium'}`}>
                    {card.sign}₹{card.value.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Expense Form ── */}
            <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#E8E5DF] bg-[#FAFAF8]">
                <h2 className="text-sm font-semibold text-[#1A1A2E]">
                  {editItem ? '✏️ Edit Transaction' : '+ New Transaction'}
                </h2>
              </div>
              <div className="p-5">
                <ExpenseForm
                  onExpenseAdded={fetchExpenses}
                  editItem={editItem}
                  onCancelEdit={() => setEditItem(null)}
                />
              </div>
            </div>

            {/* ── Search Bar ── */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AAA]" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${MONTH_NAMES[activeMonth.month]}...`}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E5DF] rounded-xl text-sm text-[#333] placeholder-[#BBB] focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]/10 focus:border-[#1A1A2E] transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#555]">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* ── Transactions Table ── */}
            <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#E8E5DF] bg-[#FAFAF8] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1A1A2E]">Transactions</h2>
                <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-[#999]">
                  {displayedExpenses.length} record{displayedExpenses.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-[#AAA] border-b border-[#E8E5DF]">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Details</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isInitialLoading ? (
                      [...Array(4)].map((_, i) => (
                        <tr key={i} className="border-b border-[#F0EDE7]">
                          {[...Array(5)].map((_, j) => (
                            <td key={j} className="px-5 py-4">
                              <div className="h-3 bg-[#F0EDE7] rounded animate-pulse" style={{ width: j === 3 ? '60px' : j === 4 ? '80px' : '100%', marginLeft: j === 3 ? 'auto' : 0 }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : displayedExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center">
                          <div className="text-3xl mb-2">📭</div>
                          <p className="text-sm text-[#AAA]">
                            {searchQuery
                              ? 'No matching transactions.'
                              : `No transactions in ${MONTH_NAMES[activeMonth.month]} ${activeMonth.year}.`}
                          </p>
                          {!isCurrentMonth && !searchQuery && (
                            <button
                              onClick={goToNextMonth}
                              className="mt-3 text-xs font-semibold text-[#1A1A2E] underline underline-offset-2 hover:text-[#E8C547] transition-colors"
                            >
                              Go to next month →
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      displayedExpenses.map((exp, idx) => {
                        const isConfirming = confirmingDeleteId === exp._id;
                        const amount = parseAmount(exp.amount);
                        return (
                          <tr
                            key={exp._id}
                            className="border-b border-[#F7F6F3] last:border-0 transition-colors duration-150"
                            style={{ background: isConfirming ? '#FFF5F5' : idx % 2 === 0 ? 'white' : '#FAFAF8' }}
                          >
                            <td className="px-5 py-3.5">
                              <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-[#888]">
                                {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 max-w-50">
                              <div className="font-semibold text-sm text-[#1A1A2E] truncate">{exp.description}</div>
                              <div className="text-[11px] text-[#94A3B8] font-medium mt-0.5">{exp.category}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={exp.type === 'income'
                                  ? { background: '#DCFCE7', color: '#15803D' }
                                  : { background: '#FEE2E2', color: '#B91C1C' }
                                }
                              >
                                {exp.type || 'expense'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span
                                style={{ fontFamily: "'DM Mono', monospace", color: exp.type === 'income' ? '#16A34A' : '#1A1A2E' }}
                                className="text-sm font-bold"
                              >
                                {exp.type === 'income' ? '+' : '-'}₹{amount.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              {isConfirming ? (
                                <div ref={confirmRef} className="inline-flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-1.5 shadow-sm">
                                  <span className="text-red-600 text-xs font-semibold">Delete?</span>
                                  <button
                                    onClick={() => performDelete(exp._id)}
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-md disabled:opacity-50 transition-colors"
                                  >
                                    {isDeleting ? '...' : 'Yes'}
                                  </button>
                                  <button onClick={() => setConfirmingDeleteId(null)} className="text-[#AAA] hover:text-[#555] p-0.5 rounded">
                                    <X size={13} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    onClick={() => { setEditItem(exp); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="text-[#94A3B8] hover:text-[#1A1A2E] transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => setConfirmingDeleteId(exp._id)}
                                    className="text-[#94A3B8] hover:text-red-500 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
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
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;