'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, X } from 'lucide-react';

interface Recommendation {
  id: string;
  channelName: string;
  recommendationType: string;
  title: string;
  description: string;
  confidenceScore: number;
  expectedImpactPercentage: number;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/recommendations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Load recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 30) return 'bg-red-100 text-red-800';
    if (impact >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getImpactLabel = (impact: number) => {
    if (impact >= 30) return 'High Impact';
    if (impact >= 20) return 'Medium Impact';
    return 'Low Impact';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Lightbulb className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
      </div>
      <p className="text-sm text-gray-600 mb-8">
        Personalized suggestions to grow your channels
      </p>

      {recommendations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recommendations available yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Add channels and wait for data collection to generate insights
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-lg bg-white p-6 shadow-md border-l-4 border-blue-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getImpactColor(
                        rec.expectedImpactPercentage
                      )}`}
                    >
                      {getImpactLabel(rec.expectedImpactPercentage)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {rec.channelName}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Expected Impact: +{rec.expectedImpactPercentage}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Confidence: {(rec.confidenceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <button className="ml-4 text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
