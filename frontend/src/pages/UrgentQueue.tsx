import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { UrgencyBadge } from '../components/UrgencyBadge';
import type { UrgentQueueResponse, Feedback } from '../types/feedback';

export function UrgentQueue() {
  const [urgentData, setUrgentData] = useState<UrgentQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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

  const handleViewDetails = async (feedbackId: string) => {
    try {
      setModalLoading(true);
      setModalError(null);
      const feedback = await apiService.getFeedbackById(feedbackId);
      setSelectedFeedback(feedback);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to load feedback details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedFeedback(null);
    setModalError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500 text-lg">Loading urgent items...</div>
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

  if (!urgentData) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Urgent Queue</h2>
        <p className="text-gray-600 mt-1">High-priority feedback requiring immediate attention (last 24 hours)</p>
      </div>

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
        {urgentData.urgent_items.length === 0 ? (
          <div className="bg-green-50 rounded-xl shadow-sm p-12 text-center border-2 border-green-200">
            <div className="text-green-800 text-lg font-semibold">
              No urgent items in the last 24 hours!
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
                      {typeof item.category === 'object' && 'name' in item.category
                        ? item.category.name
                        : item.category}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-900 text-lg mb-4 leading-relaxed">{item.content}</p>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                    AI Analysis
                  </span>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">{item.urgency_reasoning}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {item.frequency_count > 1 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold border border-red-300">
                      {item.frequency_count} similar reports
                    </span>
                  )}
                  <button
                    onClick={() => handleViewDetails(item.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    View More
                  </button>
                </div>
                <div className="text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Detail Modal */}
      {(selectedFeedback || modalLoading) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {modalLoading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse text-gray-500 text-lg">Loading details...</div>
              </div>
            ) : modalError ? (
              <div className="p-8">
                <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-lg">
                  <strong>Error:</strong> {modalError}
                </div>
                <button
                  onClick={handleCloseModal}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            ) : selectedFeedback ? (
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Details</h2>
                    <div className="flex items-center gap-3">
                      {selectedFeedback.urgency_score && (
                        <UrgencyBadge score={selectedFeedback.urgency_score} size="lg" />
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                        {selectedFeedback.source.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {selectedFeedback.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Feedback Content
                    </h3>
                    <p className="text-gray-900 text-lg leading-relaxed">{selectedFeedback.content}</p>
                  </div>

                  {selectedFeedback.urgency_reasoning && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                      <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-2">
                        AI Analysis
                      </h3>
                      <p className="text-sm text-amber-900 leading-relaxed">
                        {selectedFeedback.urgency_reasoning}
                      </p>
                    </div>
                  )}

                  {/* Customer Info */}
                  {selectedFeedback.customer && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wide mb-3">
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedFeedback.customer.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tier:</span>
                          <span className="ml-2 font-bold text-purple-800">
                            {selectedFeedback.customer.tier.toUpperCase()}
                          </span>
                        </div>
                        {selectedFeedback.customer.company_name && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Company:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedFeedback.customer.company_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category & Tags */}
                  <div className="flex flex-wrap gap-3">
                    {selectedFeedback.category && (
                      <div>
                        <span className="text-sm text-gray-600 mr-2">Category:</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          {typeof selectedFeedback.category === 'object'
                            ? selectedFeedback.category.name
                            : selectedFeedback.category}
                        </span>
                      </div>
                    )}
                    {selectedFeedback.tags && selectedFeedback.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Tags:</span>
                        {selectedFeedback.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Similar Feedback */}
                  {selectedFeedback.similar_feedback && selectedFeedback.similar_feedback.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                        Similar Feedback ({selectedFeedback.similar_feedback.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedFeedback.similar_feedback.map((similar) => (
                          <div key={similar.id} className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm text-gray-900 mb-2">{similar.content}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{similar.customer_tier && `${similar.customer_tier.toUpperCase()} tier`}</span>
                              <span>{new Date(similar.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {selectedFeedback.metadata && Object.keys(selectedFeedback.metadata).length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                        Additional Metadata
                      </h3>
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(selectedFeedback.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <div>
                      Frequency: <span className="font-semibold">{selectedFeedback.frequency_count}</span> report(s)
                    </div>
                    <div>
                      Created: {new Date(selectedFeedback.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={handleCloseModal}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
