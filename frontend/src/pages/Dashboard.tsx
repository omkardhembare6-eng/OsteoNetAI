import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, ShieldCheck, Target, Plus, Clock, ArrowRight } from 'lucide-react';
import { api, type Stats, type PredictionRecord } from '../lib/api';
import HeroScene from '../components/HeroScene';
import StatsCard from '../components/StatsCard';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, predsData] = await Promise.all([
          api.getStats(),
          api.getPredictions(),
        ]);
        setStats(statsData);
        setPredictions(predsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const recentPredictions = predictions
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 5);

  const getRiskBadge = (level: string) => {
    const normalized = level?.toLowerCase() || '';
    if (normalized === 'high') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
          High
        </span>
      );
    }
    if (normalized === 'medium') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
        Low
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-800 shadow-2xl mb-8" style={{ minHeight: '400px' }}>
          <div className="relative z-10 flex flex-col lg:flex-row items-center h-full px-8 lg:px-12 py-12">
            {/* Left side text */}
            <div className="flex-1 text-white space-y-6">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-cyan-200">
                Clinical Decision Support
              </p>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                OsteoNet AI
              </h1>
              <p className="text-lg lg:text-xl text-blue-100 max-w-lg">
                AI-Powered Osteoporosis Risk Prediction System
              </p>
              <div className="flex flex-wrap gap-4 pt-4 relative z-20">
                <Link
                  to="/predict"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  New Prediction
                </Link>
                <Link
                  to="/history"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Clock className="w-5 h-5" />
                  View History
                </Link>
              </div>
            </div>

            {/* Right side 3D scene */}
            <div className="flex-1 w-full h-64 lg:h-80 mt-8 lg:mt-0">
              <HeroScene />
            </div>
          </div>

          {/* Decorative blobs — pointer-events-none so they don't block clicks */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Predictions"
              value={stats.total_predictions}
              icon={<Activity className="w-6 h-6" />}
              color="blue"
              subtitle="All time predictions"
            />
            <StatsCard
              title="High Risk Cases"
              value={stats.high_risk_count}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
              subtitle="Requires attention"
            />
            <StatsCard
              title="Low Risk Cases"
              value={stats.low_risk_count}
              icon={<ShieldCheck className="w-6 h-6" />}
              color="green"
              subtitle="Healthy patients"
            />
            <StatsCard
              title="Model Accuracy"
              value="89.29%"
              icon={<Target className="w-6 h-6" />}
              color="purple"
              subtitle="Validated accuracy"
            />
          </div>
        ) : null}

        {/* Recent Predictions Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Predictions
            </h2>
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              ))}
            </div>
          ) : recentPredictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Age</th>
                    <th className="px-6 py-4">Risk Score</th>
                    <th className="px-6 py-4">Risk Level</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentPredictions.map((pred, index) => (
                    <tr
                      key={pred.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {pred.patient?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {pred.age || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {typeof pred.risk_score === 'number'
                          ? `${(pred.risk_score * 100).toFixed(1)}%`
                          : '-'}
                      </td>
                      <td className="px-6 py-4">{getRiskBadge(pred.risk_level)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {pred.created_at
                          ? new Date(pred.created_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/result/${pred.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No predictions yet. Start by creating a new assessment.
              </p>
              <Link
                to="/predict"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Prediction
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
