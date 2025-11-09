'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  totalChannels: number;
  totalSubscribers: number;
  subscriberGrowth30d: number;
  avgEngagementRate: number;
  estimatedMonthlyRevenue: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalChannels: 0,
    totalSubscribers: 0,
    subscriberGrowth30d: 0,
    avgEngagementRate: 0,
    estimatedMonthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (err) {
      console.error('Load dashboard error:', err);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Welcome to your Telegram channel analytics dashboard
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat cards */}
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Total Channels</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data.totalChannels}</p>
          <p className="mt-1 text-xs text-gray-500">
            {data.totalChannels === 0 ? 'No channels added yet' : 'Active channels'}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.totalSubscribers.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-green-600">
            {data.subscriberGrowth30d > 0 ? '+' : ''}
            {data.subscriberGrowth30d.toLocaleString()} (30d)
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.avgEngagementRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">Across all channels</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Est. Revenue</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${data.estimatedMonthlyRevenue.toFixed(0)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Monthly estimate</p>
        </div>
      </div>

      {/* Quick actions */}
      {data.totalChannels === 0 && (
        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Quick Start</h2>
          <p className="mt-1 text-sm text-gray-600">
            Get started by adding your first Telegram channel
          </p>
          <Link
            href="/dashboard/channels"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Add Channel
          </Link>
        </div>
      )}
    </div>
  );
}
