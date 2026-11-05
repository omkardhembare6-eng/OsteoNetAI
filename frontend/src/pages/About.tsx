import { useEffect, useState } from 'react';
import {
  Brain,
  Target,
  Crosshair,
  Repeat2,
  BarChart3,
  TrendingUp,
  Layers,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Database,
  Loader2,
} from 'lucide-react';
import { api, type ModelInfo } from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400',
  };

  const iconBgClasses: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/40',
    green: 'bg-green-100 dark:bg-green-900/40',
    purple: 'bg-purple-100 dark:bg-purple-900/40',
    amber: 'bg-amber-100 dark:bg-amber-900/40',
    red: 'bg-red-100 dark:bg-red-900/40',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/40',
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconBgClasses[color]}`}>{icon}</div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

const BAR_COLORS = [
  '#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
];

const defaultFeatureImportances = [
  { feature: 'Age', importance: 15.2 },
  { feature: 'Hormonal Changes', importance: 14.8 },
  { feature: 'Family History', importance: 12.1 },
  { feature: 'Body Weight', importance: 10.5 },
  { feature: 'Calcium Intake', importance: 9.8 },
  { feature: 'Vitamin D Intake', importance: 9.2 },
  { feature: 'Physical Activity', importance: 8.6 },
  { feature: 'Smoking', importance: 7.4 },
  { feature: 'Alcohol Consumption', importance: 6.5 },
  { feature: 'Medical Conditions', importance: 5.9 },
];

export default function About() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModel() {
      try {
        const data = await api.getModelInfo();
        setModelInfo(data);
      } catch (err) {
        console.error('Failed to fetch model info:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchModel();
  }, []);

  const featureData = (modelInfo?.feature_importances || defaultFeatureImportances)
    .sort((a: any, b: any) => (b.importance ?? b.value ?? 0) - (a.importance ?? a.value ?? 0));

  const chartData = featureData.map((f: any) => ({
    name: f.feature || f.name || f.label,
    value: f.importance ?? f.value ?? 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Loading model information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            About OsteoNet AI
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Understanding the AI model behind osteoporosis risk prediction
          </p>
        </div>

        {/* Description Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Model Description
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {modelInfo?.description ||
              'OsteoNet AI utilizes a Gradient Boosting Classifier trained on clinical and demographic data to predict osteoporosis risk. The model analyzes 10 key features including age, hormonal status, family history, lifestyle factors, and nutritional intake to provide a comprehensive risk assessment. It classifies patients into two categories: Normal (no osteoporosis) and Osteoporosis (detected), while also providing a continuous risk score and risk level categorization (Low, Medium, High) to support clinical decision-making.'}
          </p>
        </div>

        {/* Model Performance Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Model Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Accuracy"
              value={modelInfo?.accuracy ? `${(modelInfo.accuracy * 100).toFixed(2)}%` : '89.29%'}
              icon={<Target className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              title="Precision"
              value={modelInfo?.precision ? `${(modelInfo.precision * 100).toFixed(2)}%` : '99.36%'}
              icon={<Crosshair className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              title="Recall"
              value={modelInfo?.recall ? `${(modelInfo.recall * 100).toFixed(2)}%` : '79.08%'}
              icon={<Repeat2 className="w-5 h-5" />}
              color="purple"
            />
            <MetricCard
              title="F1-Score"
              value={modelInfo?.f1_score ? `${(modelInfo.f1_score * 100).toFixed(2)}%` : '88.07%'}
              icon={<BarChart3 className="w-5 h-5" />}
              color="amber"
            />
            <MetricCard
              title="ROC-AUC"
              value={modelInfo?.roc_auc ? `${(modelInfo.roc_auc * 100).toFixed(2)}%` : '93.29%'}
              icon={<TrendingUp className="w-5 h-5" />}
              color="red"
            />
            <MetricCard
              title="CV Accuracy"
              value={
                modelInfo?.cv_accuracy ? `${(modelInfo.cv_accuracy * 100).toFixed(2)}%` : '90.50%'
              }
              icon={<Layers className="w-5 h-5" />}
              color="cyan"
            />
          </div>
        </div>

        {/* Feature Importance Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Feature Importance
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  width={110}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Importance']}
                  contentStyle={{
                    backgroundColor: 'var(--tw-bg-opacity, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Guide */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Risk Level Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Low Risk */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 border-green-200 dark:border-green-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">Low Risk</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                Risk score below 30%. The patient shows minimal indicators for osteoporosis.
                Regular monitoring and maintaining healthy lifestyle habits are recommended.
              </p>
              <div className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-1.5 inline-block">
                Score: 0% – 30%
              </div>
            </div>

            {/* Medium Risk */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 border-amber-200 dark:border-amber-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-amber-700 dark:text-amber-400">Medium Risk</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                Risk score between 30% and 70%. The patient has moderate risk factors.
                Further clinical evaluation and preventive measures are advised.
              </p>
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1.5 inline-block">
                Score: 30% – 70%
              </div>
            </div>

            {/* High Risk */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border-2 border-red-200 dark:border-red-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-red-700 dark:text-red-400">High Risk</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                Risk score above 70%. The patient has significant risk factors for osteoporosis.
                Immediate clinical intervention, DEXA scan, and treatment plan are recommended.
              </p>
              <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-1.5 inline-block">
                Score: 70% – 100%
              </div>
            </div>
          </div>
        </div>

        {/* Dataset Info */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dataset Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {modelInfo?.dataset_samples || '1,958'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Samples</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {modelInfo?.top_features_used || '10'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Features</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {modelInfo?.test_split || '20%'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Test Split</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
