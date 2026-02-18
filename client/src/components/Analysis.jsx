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
  // 🔹 Safe amount parser (handles MongoDB Decimal)
  const parseAmount = (amt) =>
    parseFloat(amt?.$numberDecimal || amt || 0);

  // 🔹 Filter only expenses for pie chart
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

  // 🔹 Totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Spending Analysis
      </h2>

      {/* 🔹 Pie Chart */}
      {expenseData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No expense data available yet.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={expenseData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 🔹 Financial Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income */}
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-600 font-bold">
            Total Income
          </p>
          <p className="text-2xl font-bold text-green-800">
            ₹{totalIncome.toFixed(2)}
          </p>
        </div>

        {/* Expenses */}
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-600 font-bold">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-red-800">
            ₹{totalExpenses.toFixed(2)}
          </p>
        </div>

        {/* Net Balance */}
        <div
          className={`p-4 rounded-lg ₹{
            netBalance >= 0
              ? 'bg-blue-50'
              : 'bg-yellow-50'
          }`}
        >
          <p
            className={`font-bold ₹{
              netBalance >= 0
                ? 'text-blue-600'
                : 'text-yellow-600'
            }`}
          >
            Net Balance
          </p>
          <p
            className={`text-2xl font-bold ₹{
              netBalance >= 0
                ? 'text-blue-800'
                : 'text-yellow-800'
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