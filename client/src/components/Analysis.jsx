import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const Analysis = ({ transactions = [] }) => {
  // Safe amount parser (handles MongoDB Decimal128)
  const parseAmount = (amt) =>
    parseFloat(amt?.$numberDecimal || amt || 0);

  // Build expense data by category
  const expenseData = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const amt = parseAmount(t.amount);
      const found = acc.find((item) => item.name === t.category);

      if (found) {
        found.value += amt;
      } else {
        acc.push({ name: t.category, value: amt });
      }
      return acc;
    }, []);

  // Calculate totals
  const totalExpenses = expenseData.reduce((sum, cat) => sum + cat.value, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  // Add percentage to each category (only if total > 0)
  const expenseDataWithPercent = expenseData.map((cat) => ({
    ...cat,
    percent:
      totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(1) : 0
  }));

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#AF19FF',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEEAD'
  ];

  if (expenseData.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md mt-8">
        <h2 className="text-2xl font-bold mb-6">Spending Analysis</h2>
        <div className="text-center py-12 text-gray-500">
          No expense data available yet.
        </div>

        {/* Still show income & balance even with no expenses */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-600 font-bold">Total Income</p>
            <p className="text-2xl font-bold text-green-800">
              ₹{totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-red-600 font-bold">Total Expenses</p>
            <p className="text-2xl font-bold text-red-800">₹0.00</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-bold text-blue-600">Net Balance</p>
            <p className="text-2xl font-bold text-blue-800">
              ₹{totalIncome.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-6">Spending Analysis</h2>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={expenseDataWithPercent}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${percent}%`}
              >
                {expenseDataWithPercent.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value.toFixed(2)}`}
                labelFormatter={(name) => name}
              />
              {/* Optional: built-in legend – we can keep or remove */}
              {/* <Legend /> */}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown list */}
        <div className="w-full lg:w-1/2">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <div className="space-y-3">
            {expenseDataWithPercent
              .sort((a, b) => b.value - a.value) // largest first
              .map((cat, index) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{cat.value.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{cat.percent}%</div>
                  </div>
                </div>
              ))}
          </div>

          {/* Total expenses row */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center font-bold">
            <span>Total Expenses</span>
            <span>₹{totalExpenses.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-green-50 rounded-lg border border-green-100">
          <p className="text-green-700 font-semibold">Total Income</p>
          <p className="text-3xl font-bold text-green-800 mt-1">
            ₹{totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="p-5 bg-red-50 rounded-lg border border-red-100">
          <p className="text-red-700 font-semibold">Total Expenses</p>
          <p className="text-3xl font-bold text-red-800 mt-1">
            ₹{totalExpenses.toFixed(2)}
          </p>
        </div>

        <div
          className={`p-5 rounded-lg border ${
            netBalance >= 0
              ? 'bg-blue-50 border-blue-100'
              : 'bg-yellow-50 border-yellow-100'
          }`}
        >
          <p
            className={`font-semibold ${
              netBalance >= 0 ? 'text-blue-700' : 'text-yellow-700'
            }`}
          >
            Net Balance
          </p>
          <p
            className={`text-3xl font-bold mt-1 ${
              netBalance >= 0 ? 'text-blue-800' : 'text-yellow-800'
            }`}
          >
            ₹{netBalance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analysis;