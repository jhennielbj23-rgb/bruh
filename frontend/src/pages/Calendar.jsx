
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { expenseAPI } from '../services/api';
import toast from 'react-hot-toast';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, [currentDate]);

  const fetchMonthlyData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await expenseAPI.getMonthly(year, month);
      setMonthlyData(res.data.data);
    } catch (error) {
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="spinner"></div></div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">{format(currentDate, 'MMMM yyyy')}</p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Calendar grid would go here - simplified for demo */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-semibold">1</div>
            <div className="text-xs text-gray-500">₱0</div>
          </div>
        </div>
      </div>

      {monthlyData && (
        <div className="mt-6 bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Month Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="font-semibold">₱{monthlyData.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transactions:</span>
              <span className="font-semibold">{monthlyData.count}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
EOF
echo "Calendar created"
