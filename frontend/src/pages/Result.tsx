import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Plus,
  Clock,
  Printer,
  Download,
} from 'lucide-react';
import { api, type PredictionRecord } from '../lib/api';
import RiskCircle from '../components/RiskCircle';
import FeatureChart from '../components/FeatureChart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Result() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<PredictionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResult() {
      if (!id) return;
      try {
        const data = await api.getPrediction(Number(id));
        setResult(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load prediction result.');
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  const isOsteoporosis = result?.prediction === 1;
  const riskScore = result?.risk_score ?? 0;

  const patientDetails = result
    ? [
        { label: 'Patient Name', value: result.patient?.name || 'Unknown' },
        { label: 'Age', value: result.age ?? '-' },
        { label: 'Gender', value: result.gender ?? '-' },
        { label: 'Hormonal Changes', value: result.hormonal_changes ?? '-' },
        { label: 'Family History', value: result.family_history ?? '-' },
        { label: 'Prior Fractures', value: result.prior_fractures ?? '-' },
        { label: 'Medical Conditions', value: result.medical_conditions ?? '-' },
        { label: 'Medications', value: result.medications ?? '-' },
        { label: 'Body Weight', value: result.body_weight ?? '-' },
        { label: 'Physical Activity', value: result.physical_activity ?? '-' },
        { label: 'Smoking', value: result.smoking ?? '-' },
        { label: 'Alcohol Consumption', value: result.alcohol_consumption ?? '-' },
        { label: 'Calcium Intake', value: result.calcium_intake ?? '-' },
        { label: 'Vitamin D Intake', value: result.vitamin_d_intake ?? '-' },
        { label: 'Race / Ethnicity', value: result.race_ethnicity ?? '-' },
      ]
    : [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text('OsteoNet AI - Risk Assessment Report', 14, 22);

    // Line separator
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(14, 26, 196, 26);

    // Risk summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Risk Assessment Summary', 14, 38);

    doc.setFontSize(11);
    doc.text(`Patient: ${result.patient?.name || 'Unknown'}`, 14, 48);
    doc.text(`Risk Score: ${(riskScore * 100).toFixed(1)}%`, 14, 56);
    doc.text(`Risk Level: ${result.risk_level || '-'}`, 14, 64);
    doc.text(
      `Prediction: ${isOsteoporosis ? 'Osteoporosis Detected' : 'No Osteoporosis Detected'}`,
      14,
      72
    );
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 80);

    // Patient Details Table
    doc.setFontSize(14);
    doc.text('Patient Details', 14, 96);

    const tableData = patientDetails.map((d) => [d.label, String(d.value)]);

    autoTable(doc, {
      startY: 100,
      head: [['Parameter', 'Value']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Feature contributions if available
    if (result.feature_contributions && result.feature_contributions.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || 200;

      if (finalY > 240) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Risk Factor Contributions', 14, 20);

        const contribData = result.feature_contributions.map((c: any) => [
          c.label || c.feature,
          `${c.contribution_percent?.toFixed(1)}%`,
          c.impact || '-',
        ]);

        autoTable(doc, {
          startY: 24,
          head: [['Feature', 'Contribution', 'Impact']],
          body: contribData,
          theme: 'grid',
          headStyles: { fillColor: [30, 64, 175], textColor: 255 },
          styles: { fontSize: 10 },
        });
      } else {
        doc.setFontSize(14);
        doc.text('Risk Factor Contributions', 14, finalY + 16);

        const contribData = result.feature_contributions.map((c: any) => [
          c.label || c.feature,
          `${c.contribution_percent?.toFixed(1)}%`,
          c.impact || '-',
        ]);

        autoTable(doc, {
          startY: finalY + 20,
          head: [['Feature', 'Contribution', 'Impact']],
          body: contribData,
          theme: 'grid',
          headStyles: { fillColor: [30, 64, 175], textColor: 255 },
          styles: { fontSize: 10 },
        });
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'Generated by OsteoNet AI - AI-Powered Osteoporosis Risk Prediction System',
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`OsteoNet_AI_Report_${result.patient?.name || 'patient'}_${id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Loading prediction result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error || 'Result not found.'}</p>
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Assessment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Risk Score Circle */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <RiskCircle score={riskScore} />
            </div>

            {/* Prediction Label */}
            {isOsteoporosis ? (
              <div className="flex items-center gap-3 px-6 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span className="text-lg font-bold text-red-700 dark:text-red-400">
                  Osteoporosis Detected
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-6 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                  No Osteoporosis Detected
                </span>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Risk Level:{' '}
                <span
                  className={`font-semibold ${
                    result.risk_level?.toLowerCase() === 'high'
                      ? 'text-red-600 dark:text-red-400'
                      : result.risk_level?.toLowerCase() === 'medium'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {result.risk_level || '-'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Risk Factor Breakdown */}
        {result.feature_contributions && result.feature_contributions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Risk Factor Breakdown
            </h2>
            <FeatureChart contributions={result.feature_contributions} />
          </div>
        )}

        {/* Patient Details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Patient Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">{detail.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {String(detail.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            New Assessment
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow transition-all"
          >
            <Clock className="w-5 h-5" />
            View History
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow transition-all"
          >
            <Printer className="w-5 h-5" />
            Print Report
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
