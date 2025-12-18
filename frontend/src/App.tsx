import { useState, useEffect } from 'react';
import { apiService } from './services/api';
import { UrgencyBadge } from './components/UrgencyBadge';
import type { UrgentQueueResponse } from './types/feedback';

function App() {
  const [urgentData, setUrgentData] = useState<UrgentQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUrgentQueue();
  }, []);

  const loadUrgentQueue = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUrgentQueue({ min_urgency: 70, hours: 24 });
      setUrgentData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Feedback Triage System
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            AI-powered feedback prioritization • Last 24 hours
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500 text-lg">Loading urgent items...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-lg">
            <strong>Error:</strong> {error}
            <div className="mt-2 text-sm">Make sure the backend is running at http://localhost:3000</div>
          </div>
        )}

        {!loading && !error && urgentData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200">
                <div className="text-sm font-medium text-gray-600">Total Urgent</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {urgentData.summary.total_urgent}
                </div>
              </div>
              <div className="bg-red-50 rounded-xl shadow-sm p-6 border-2 border-red-300">
                <div className="text-sm font-semibold text-red-700">Critical (90+)</div>
                <div className="text-3xl font-bold text-red-900 mt-2">
                  {urgentData.summary.critical_count}
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl shadow-sm p-6 border-2 border-orange-300">
                <div className="text-sm font-semibold text-orange-700">High (70-89)</div>
                <div className="text-3xl font-bold text-orange-900 mt-2">
                  {urgentData.summary.high_count}
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl shadow-sm p-6 border-2 border-blue-300">
                <div className="text-sm font-semibold text-blue-700">Feedback Items</div>
                <div className="text-3xl font-bold text-blue-900 mt-2">
                  {urgentData.urgent_items.length}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Urgent Feedback Queue</h2>
              {urgentData.urgent_items.length === 0 ? (
                <div className="bg-green-50 rounded-xl shadow-sm p-12 text-center border-2 border-green-200">
                  <div className="text-green-800 text-lg font-semibold">
                    🎉 No urgent items in the last 24 hours!
                  </div>
                  <div className="text-green-600 mt-2">Everything is under control.</div>
                </div>
              ) : (
                urgentData.urgent_items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <UrgencyBadge score={item.urgency_score} size="lg" />
                      <div className="flex items-center gap-2">
                        {item.customer_tier && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            {item.customer_tier.toUpperCase()}
                          </span>
                        )}
                        {item.category && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-900 text-lg mb-4 leading-relaxed">{item.content}</p>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                          🤖 AI Analysis
                        </span>
                      </div>
                      <p className="text-sm text-amber-900 leading-relaxed">{item.urgency_reasoning}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        {item.frequency_count > 1 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold border border-red-300">
                            🔥 {item.frequency_count} similar reports
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Built with NestJS • Supabase • OpenAI GPT-4 • React • Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
