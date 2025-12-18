import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { UrgencyBadge } from '../components/UrgencyBadge';
import type { FeedbackListResponse, Feedback } from '../types/feedback';

export function BugSearch() {
  const [feedbackData, setFeedbackData] = useState<FeedbackListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [minUrgency, setMinUrgency] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'urgency_score' | 'created_at' | 'frequency_count'>('urgency_score');

  useEffect(() => {
    loadFeedback();
  }, [searchQuery, categoryFilter, tierFilter, minUrgency, sortBy]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFeedbackList({
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        customer_tier: tierFilter || undefined,
        min_urgency: minUrgency,
        sort_by: sortBy,
        sort_order: 'desc',
        limit: 50,
      });
      setFeedbackData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFeedback();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setTierFilter('');
    setMinUrgency(undefined);
    setSortBy('urgency_score');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bug Search & Analysis</h2>
        <p className="text-gray-600 mt-1">Search and filter feedback with advanced criteria</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border mb-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Feedback
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by content, keywords, or phrases..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Complaint">Complaint</option>
                <option value="Praise">Praise</option>
                <option value="Question">Question</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Tier
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tiers</option>
                <option value="enterprise">Enterprise</option>
                <option value="pro">Pro</option>
                <option value="free">Free</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Urgency
              </label>
              <select
                value={minUrgency ?? ''}
                onChange={(e) => setMinUrgency(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="90">Critical (90+)</option>
                <option value="70">High (70+)</option>
                <option value="50">Medium (50+)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="urgency_score">Urgency Score</option>
                <option value="created_at">Date</option>
                <option value="frequency_count">Frequency</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results Summary */}
      {feedbackData && (
        <div className="bg-white rounded-xl shadow-sm p-4 border mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{feedbackData.data.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{feedbackData.pagination.total}</span> results
            </div>
            <div className="text-sm text-gray-600">
              Page {feedbackData.pagination.page} of {feedbackData.pagination.total_pages}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500 text-lg">Searching feedback...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && feedbackData && (
        <div className="space-y-4">
          {feedbackData.data.length === 0 ? (
            <div className="bg-gray-50 rounded-xl shadow-sm p-12 text-center border">
              <div className="text-gray-600 text-lg">No feedback found matching your criteria</div>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            feedbackData.data.map((item: Feedback) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {item.urgency_score !== null && item.urgency_score !== undefined && (
                      <UrgencyBadge score={item.urgency_score} size="md" />
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border">
                      {item.source.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.customer?.tier && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                        {item.customer.tier.toUpperCase()}
                      </span>
                    )}
                    {item.category && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        {item.category.name}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-900 text-base mb-3 leading-relaxed">{item.content}</p>

                {item.urgency_reasoning && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-3">
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
                      AI Analysis
                    </div>
                    <p className="text-sm text-amber-900">{item.urgency_reasoning}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm pt-3 border-t">
                  <div className="flex items-center gap-4">
                    {item.frequency_count > 1 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-xs">
                        {item.frequency_count} similar
                      </span>
                    )}
                    {item.customer?.email && (
                      <span className="text-gray-600">{item.customer.email}</span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.sentiment === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : item.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
