'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Eye, Heart } from 'lucide-react';

interface AnalyticsData {
  channelId: string;
  channelName: string;
  subscriberGrowth: Array<{ date: string; count: number }>;
  engagementTrend: Array<{ date: string; rate: number }>;
  topPosts: Array<{
    id: string;
    date: string;
    contentType: string;
    views: number;
    reactions: number;
    engagementRate: number;
  }>;
  summary: {
    totalViews: number;
    totalReactions: number;
    avgEngagement: number;
    subscriberGrowth: number;
  };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/analytics/detailed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || []);
        if (data.analytics && data.analytics.length > 0) {
          setSelectedChannel(data.analytics[0].channelId);
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentAnalytics = analytics.find((a) => a.channelId === selectedChannel);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <BarChart3 className="h-16 w-16 text-gray-400" />
        <p className="text-gray-600">No analytics data available</p>
        <p className="text-sm text-gray-500">Add channels and wait for data collection</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed insights for your channels</p>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {analytics.map((channel) => (
          <button
            key={channel.channelId}
            onClick={() => setSelectedChannel(channel.channelId)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedChannel === channel.channelId
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {channel.channelName}
          </button>
        ))}
      </div>

      {currentAnalytics && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {currentAnalytics.summary.totalViews.toLocaleString()}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reactions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {currentAnalytics.summary.totalReactions.toLocaleString()}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {currentAnalytics.summary.avgEngagement.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscriber Growth</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    +{currentAnalytics.summary.subscriberGrowth.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Top Posts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Top Performing Posts</h2>
              <p className="text-sm text-gray-600">Your best content by engagement</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAnalytics.topPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(post.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {post.contentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.reactions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.engagementRate.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Growth Chart Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subscriber Growth</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
