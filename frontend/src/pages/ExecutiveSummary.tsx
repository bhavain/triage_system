import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { SummaryResponse } from '../types/feedback';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444',
};

export function ExecutiveSummary() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadSummary();
  }, [period]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSummary({ period });
      setSummary(data);
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
        <div className="animate-pulse text-gray-500 text-lg">Loading executive summary...</div>
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

  if (!summary) return null;

  const sentimentData = [
    { name: 'Positive', value: summary.metrics.sentiment_distribution.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: summary.metrics.sentiment_distribution.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: summary.metrics.sentiment_distribution.negative, color: SENTIMENT_COLORS.negative },
  ];

  const totalSentiment = sentimentData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
          <p className="text-gray-600 mt-1">High-level customer feedback insights and trends</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((p) => (
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

      {/* Period Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="text-sm text-blue-800">
          <strong>Reporting Period:</strong> {new Date(summary.period.start).toLocaleDateString()} -{' '}
          {new Date(summary.period.end).toLocaleDateString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <div className="text-sm font-medium text-gray-600">Total Feedback</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {summary.metrics.total_feedback}
          </div>
          <div className="text-xs text-gray-500 mt-2">All sources combined</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-200">
          <div className="text-sm font-medium text-gray-600">NPS Score</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {summary.metrics.nps_score}
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            {summary.metrics.nps_trend === 'up' && <span className="text-green-600">↑ Improving</span>}
            {summary.metrics.nps_trend === 'down' && <span className="text-red-600">↓ Declining</span>}
            {summary.metrics.nps_trend === 'stable' && <span className="text-gray-600">→ Stable</span>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-green-200">
          <div className="text-sm font-medium text-gray-600">Response Rate</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {summary.metrics.response_rate}%
          </div>
          <div className="text-xs text-gray-500 mt-2">Feedback reviewed</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-orange-200">
          <div className="text-sm font-medium text-gray-600">Avg Resolution Time</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {summary.metrics.avg_resolution_time}h
          </div>
          <div className="text-xs text-gray-500 mt-2">Time to resolve</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sentiment Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Sentiment</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${((value / totalSentiment) * 100).toFixed(0)}%`}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="text-xs text-gray-600">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Feedback Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={summary.top_categories.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Issues */}
      <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Critical Issues Requiring Attention</h3>
        {summary.critical_issues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No critical issues in this period
          </div>
        ) : (
          <div className="space-y-3">
            {summary.critical_issues.map((issue, index) => (
              <div
                key={index}
                className="border-l-4 border-red-500 bg-red-50 p-4 rounded hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                      URGENT {issue.urgency_score}
                    </span>
                    <span className="text-sm font-semibold text-red-900">
                      {issue.affected_customers} customer{issue.affected_customers > 1 ? 's' : ''} affected
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-900 font-medium">{issue.issue}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <div className="text-sm font-semibold text-blue-800 mb-2">
            Most Requested Feature
          </div>
          <p className="text-base text-blue-900 font-medium">
            {summary.highlights.most_requested_feature || 'No feature requests'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-6 border-2 border-red-200">
          <div className="text-sm font-semibold text-red-800 mb-2">
            Biggest Pain Point
          </div>
          <p className="text-base text-red-900 font-medium">
            {summary.highlights.biggest_pain_point || 'No major issues'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border-2 border-green-200">
          <div className="text-sm font-semibold text-green-800 mb-2">
            Customer Praise
          </div>
          <p className="text-base text-green-900 font-medium">
            {summary.highlights.praise_summary || 'No praise received'}
          </p>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h3>
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
                  Change vs Previous
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.top_categories.map((cat) => (
                <tr key={cat.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cat.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cat.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${
                        cat.change_percent > 0
                          ? 'text-green-600'
                          : cat.change_percent < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {cat.change_percent > 0 && '↑ '}
                      {cat.change_percent < 0 && '↓ '}
                      {cat.change_percent === 0 && '→ '}
                      {Math.abs(cat.change_percent)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
