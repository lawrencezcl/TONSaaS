'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // For development: simulate TON wallet login
      const mockTonAddress = `EQ${Math.random().toString(36).substring(2, 15)}`;
      const mockProof = {
        timestamp: Math.floor(Date.now() / 1000),
        domain: 'localhost',
        signature: 'mock-signature',
        payload: 'mock-payload',
      };

      const response = await fetch('/api/auth/ton-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof: mockProof,
          tonAddress: mockTonAddress,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Authentication failed');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">ChannelGrowth</h1>
          <p className="mt-2 text-sm text-gray-600">
            AI-Powered Telegram Channel Management
          </p>
        </div>

        <div className="mt-8 space-y-6 rounded-lg bg-white p-8 shadow-md">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect your TON wallet to get started
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect TON Wallet (Demo)'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Note: This is a development version with simulated authentication
          </p>
        </div>
      </div>
    </div>
  );
}
