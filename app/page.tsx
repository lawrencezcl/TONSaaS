import Link from 'next/link';
import { ArrowRight, BarChart3, Lightbulb, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex items-center justify-between mb-16">
          <h2 className="text-2xl font-bold text-gray-900">ChannelGrowth</h2>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Grow Your Telegram Channel Revenue by{' '}
            <span className="text-blue-600">30%</span> with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered analytics and recommendations to help you understand
            what works and optimize your content strategy
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-Time Analytics
            </h3>
            <p className="text-gray-600">
              Track subscriber growth, engagement rates, and revenue estimates
              in real-time
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-4">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Recommendations
            </h3>
            <p className="text-gray-600">
              Get personalized suggestions on posting times, content types, and
              hashtags
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Growth Optimizer
            </h3>
            <p className="text-gray-600">
              Maximize ad revenue and identify sponsorship opportunities
              automatically
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join 5,000+ Channel Owners
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start growing your channel today
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
