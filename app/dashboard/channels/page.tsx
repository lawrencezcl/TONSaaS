'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface Channel {
  id: string;
  channelName: string;
  channelUsername: string | null;
  subscriberCount: number;
  lastSyncAt: string | null;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [channelId, setChannelId] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/channels', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load channels');
      }

      const data = await response.json();
      setChannels(data.channels);
    } catch (err: any) {
      console.error('Load channels error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telegramChannelId: channelId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to add channel');
      }

      // Reload channels
      await loadChannels();
      setShowAddDialog(false);
      setChannelId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Channels</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and monitor your Telegram channels
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Channel
        </button>
      </div>

      <div className="mt-8">
        {channels.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No channels added yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Click "Add Channel" to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {channel.channelName}
                    </h3>
                    {channel.channelUsername && (
                      <p className="text-sm text-gray-500">
                        {channel.channelUsername}
                      </p>
                    )}
                  </div>
                  <button className="ml-2 text-gray-400 hover:text-gray-600">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Subscribers</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {channel.subscriberCount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Sync</p>
                    <p className="text-sm text-gray-900">
                      {channel.lastSyncAt
                        ? new Date(channel.lastSyncAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Channel Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add Telegram Channel
            </h2>
            <form onSubmit={handleAddChannel}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel ID or Username
                </label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="@channelname or channel ID"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter @username or numeric channel ID
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDialog(false);
                    setError('');
                    setChannelId('');
                  }}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
