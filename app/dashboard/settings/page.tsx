'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <SettingsIcon className="h-8 w-8 text-gray-700" />
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>
      <p className="text-sm text-gray-600 mb-8">
        Manage your account settings and preferences
      </p>

      <div className="space-y-6">
        {/* Account Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TON Wallet Address
              </label>
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {user?.tonAddress || 'Not connected'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Tier
              </label>
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 capitalize">
                {user?.subscriptionTier || 'Free'}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Preferences
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Weekly insights email
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                New AI recommendations
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Marketing and product updates
              </span>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-red-700 mb-4">
            These actions cannot be undone. Please proceed with caution.
          </p>
          <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
