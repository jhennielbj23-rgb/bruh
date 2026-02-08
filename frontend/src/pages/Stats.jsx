
import React from 'react';
import { BarChart3 } from 'lucide-react';

const Stats = () => {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600">View your spending trends</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistics Coming Soon</h3>
        <p className="text-gray-600">Charts and analytics will be available here</p>
      </div>
    </div>
  );
};

export default Stats;
EOF
echo "Stats created"
