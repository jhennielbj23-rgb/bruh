
import React, { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { expenseAPI, incomeAPI } from '../services/api';
import AddExpenseModal from '../components/AddExpenseModal';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [nextPayday, setNextPayday] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, paydayRes] = await Promise.all([
        expenseAPI.getStats(),
        incomeAPI.getNextPayday()
      ]);
      setStats(statsRes.data.data);
      setNextPayday(paydayRes.data.data?.nextPayday);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="spinner"></div></div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.fullName || 'User'}! 👋</h1>
        <p className="text-gray-600">Here's your financial overview</p>
      </div>

      {nextPayday && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-5 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Next Payday</p>
              <p className="text-2xl font-bold">{user?.currency || '₱'}{nextPayday.amount}</p>
              <p className="text-sm mt-1">{nextPayday.daysUntil} days remaining</p>
            </div>
            <CalendarIcon className="w-12 h-12 opacity-80" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Today</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold">{user?.currency || '₱'}{stats?.today?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.today?.count || 0} expenses</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">This Month</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{user?.currency || '₱'}{stats?.thisMonth?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.thisMonth?.count || 0} expenses</p>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
      >
        <Plus className="w-6 h-6" />
        Add Expense
      </button>

      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Dashboard;
EOF
echo "Dashboard created"
