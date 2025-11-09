'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

export default function BillingPage() {
  const [currentTier, setCurrentTier] = useState('free');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setCurrentTier(parsedUser.subscriptionTier);
    }
  }, []);

  const plans = [
    {
      name: 'Pro',
      price: 29,
      features: [
        'Up to 5 channels',
        'Real-time analytics',
        'AI recommendations',
        'Email support',
      ],
    },
    {
      name: 'Business',
      price: 99,
      popular: true,
      features: [
        'Up to 20 channels',
        'Advanced analytics',
        'AI recommendations',
        'Competitor analysis',
        'Priority support',
      ],
    },
    {
      name: 'Enterprise',
      price: 299,
      features: [
        'Unlimited channels',
        'Everything in Business',
        'White-label dashboard',
        'API access',
        'Dedicated support',
        'Custom integrations',
      ],
    },
  ];

  const handleUpgrade = (planName: string) => {
    alert(`Upgrade to ${planName} - Payment integration coming soon!`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
      <p className="mt-2 text-sm text-gray-600 mb-8">
        Manage your subscription and billing information
      </p>

      {/* Current Plan */}
      <div className="mb-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
        <p className="text-3xl font-bold capitalize">{currentTier}</p>
        {currentTier === 'free' && (
          <p className="mt-2 text-sm text-blue-100">
            Upgrade to unlock more features
          </p>
        )}
      </div>

      {/* Pricing Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border-2 bg-white p-6 shadow-sm ${
              plan.popular
                ? 'border-blue-500 ring-2 ring-blue-500'
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <span className="inline-block rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white mb-4">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                ${plan.price}
              </span>
              <span className="ml-2 text-sm text-gray-500">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.name)}
              disabled={currentTier.toLowerCase() === plan.name.toLowerCase()}
              className={`mt-8 w-full rounded-md px-4 py-3 text-sm font-semibold shadow-sm ${
                currentTier.toLowerCase() === plan.name.toLowerCase()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              {currentTier.toLowerCase() === plan.name.toLowerCase()
                ? 'Current Plan'
                : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Method (Mock) */}
      <div className="mt-12 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Method
        </h2>
        <p className="text-sm text-gray-600">
          TON Connect wallet integration - Coming soon
        </p>
        <div className="mt-4 rounded-md bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">
            Connected Wallet: {user?.tonAddress?.substring(0, 12)}...
          </p>
        </div>
      </div>
    </div>
  );
}
