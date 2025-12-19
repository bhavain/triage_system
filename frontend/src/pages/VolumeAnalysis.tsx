import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { TrendsResponse } from '../types/feedback';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function VolumeAnalysis() {
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadTrends();
  }, [period]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTrends({ period, group_by: 'category' });
      setTrends(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500 text-lg">Loading trends data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-lg">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!trends) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Volume Analysis</h2>
          <p className="text-gray-600 mt-1">Feedback volume trends and category distribution</p>
        </div>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-sm font-medium text-gray-600">Total Volume</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {trends.volume.total}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {trends.volume.change_percent > 0 ? '↑' : trends.volume.change_percent < 0 ? '↓' : '→'}
            {' '}{Math.abs(trends.volume.change_percent)}% vs previous period
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-sm font-medium text-gray-600">Period</div>
          <div className="text-lg font-semibold text-gray-900 mt-2">
            {new Date(trends.period.start).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500">
            to {new Date(trends.period.end).toLocaleDateString()}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="text-sm font-medium text-gray-600">Categories</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {trends.by_category.length}
          </div>
          <div className="text-sm text-gray-500 mt-2">Active categories</div>
        </div>
      </div>

      {/* Volume Over Time Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Feedback Volume Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends.volume.by_day}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Feedback Count"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trends.by_category as any}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(props: any) => `${props.category}: ${props.percent}%`}
              >
                {trends.by_category.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Feedback by Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.by_source}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Feedback Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trends.by_category.map((cat, index) => (
                <tr key={cat.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="text-sm font-medium text-gray-900">{cat.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cat.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cat.percent}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        cat.trend === 'up'
                          ? 'bg-green-100 text-green-800'
                          : cat.trend === 'down'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cat.trend === 'up' ? '↑ Up' : cat.trend === 'down' ? '↓ Down' : '→ Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Issues */}
      {trends.top_issues && trends.top_issues.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Trending Issues</h3>
          <div className="space-y-3">
            {trends.top_issues.map((issue, index) => (
              <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-900">{issue.category}</span>
                  <span className="text-sm font-bold text-blue-700">{issue.count} reports</span>
                </div>
                <p className="text-sm text-gray-700">{issue.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
