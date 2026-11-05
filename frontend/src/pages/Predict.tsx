import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Loader2, FileText, PenLine } from 'lucide-react';
import { api } from '../lib/api';
import CsvUpload from '../components/CsvUpload';

type FormData = {
  patient_name: string;
  age: string;
  gender: string;
  hormonal_changes: string;
  family_history: string;
  prior_fractures: string;
  medical_conditions: string;
  medications: string;
  body_weight: string;
  physical_activity: string;
  smoking: string;
  alcohol_consumption: string;
  calcium_intake: string;
  vitamin_d_intake: string;
  race_ethnicity: string;
};

const initialForm: FormData = {
  patient_name: '',
  age: '',
  gender: '',
  hormonal_changes: '',
  family_history: '',
  prior_fractures: '',
  medical_conditions: '',
  medications: '',
  body_weight: '',
  physical_activity: '',
  smoking: '',
  alcohol_consumption: '',
  calcium_intake: '',
  vitamin_d_intake: '',
  race_ethnicity: '',
};

interface SelectFieldProps {
  label: string;
  name: keyof FormData;
  options: string[];
  value: string;
  onChange: (name: keyof FormData, value: string) => void;
}

function SelectField({ label, name, options, value, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 px-0 py-2 text-gray-900 dark:text-white text-sm appearance-none cursor-pointer transition-colors"
        required
      >
        <option value="" className="dark:bg-gray-800">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="dark:bg-gray-800">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Predict() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'manual' | 'csv'>('manual');
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: form.patient_name,
        Age: parseInt(form.age, 10),
        Gender: form.gender,
        "Hormonal Changes": form.hormonal_changes,
        "Family History": form.family_history,
        "Prior Fractures": form.prior_fractures,
        "Medical Conditions": form.medical_conditions,
        "Medications": form.medications,
        "Body Weight": form.body_weight,
        "Physical Activity": form.physical_activity,
        "Smoking": form.smoking,
        "Alcohol Consumption": form.alcohol_consumption,
        "Calcium Intake": form.calcium_intake,
        "Vitamin D Intake": form.vitamin_d_intake,
        "Race/Ethnicity": form.race_ethnicity,
      };

      const result = await api.predict(payload);
      navigate(`/result/${result.id}`);
    } catch (err: any) {
      setError(err?.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvPredict = async (rows: any[]) => {
    setLoading(true);
    setError('');
    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // CSV rows already have spaced headers matching the API,
        // but need a "name" field; use Name column or generate one
        const payload = {
          name: row['Name'] || row['name'] || `CSV Patient ${i + 1}`,
          Age: parseInt(row['Age'], 10),
          Gender: row['Gender'],
          "Hormonal Changes": row['Hormonal Changes'],
          "Family History": row['Family History'],
          "Race/Ethnicity": row['Race/Ethnicity'],
          "Body Weight": row['Body Weight'],
          "Calcium Intake": row['Calcium Intake'],
          "Vitamin D Intake": row['Vitamin D Intake'],
          "Physical Activity": row['Physical Activity'],
          "Smoking": row['Smoking'],
          "Alcohol Consumption": row['Alcohol Consumption'],
          "Medical Conditions": row['Medical Conditions'],
          "Medications": row['Medications'],
          "Prior Fractures": row['Prior Fractures'],
        };
        await api.predict(payload);
      }
      navigate('/history');
    } catch (err: any) {
      setError(err?.message || 'CSV prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              New Risk Assessment
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-14">
            All fields are required for accurate prediction.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-8 max-w-xs">
          <button
            onClick={() => setTab('manual')}
            className={`flex items-center gap-2 flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'manual'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <PenLine className="w-4 h-4" />
            Manual Input
          </button>
          <button
            onClick={() => setTab('csv')}
            className={`flex items-center gap-2 flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'csv'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            CSV Upload
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {tab === 'csv' ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <CsvUpload onPredict={handleCsvPredict} />
            {loading && (
              <div className="flex items-center justify-center gap-2 mt-6 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Processing CSV rows...</span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Information */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-6">
                Patient Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={form.patient_name}
                    onChange={(e) => handleChange('patient_name', e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 px-0 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-colors"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={90}
                      value={form.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      placeholder="Enter age (20-90)"
                      className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 px-0 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-colors"
                      required
                    />
                  </div>
                  <SelectField
                    label="Gender"
                    name="gender"
                    options={['Male', 'Female']}
                    value={form.gender}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-6">
                Medical History
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Hormonal Changes"
                    name="hormonal_changes"
                    options={['Normal', 'Postmenopausal', 'Estrogen Deficiency']}
                    value={form.hormonal_changes}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Family History"
                    name="family_history"
                    options={['Yes', 'No']}
                    value={form.family_history}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Prior Fractures"
                    name="prior_fractures"
                    options={['Yes', 'No']}
                    value={form.prior_fractures}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Medical Conditions"
                    name="medical_conditions"
                    options={['None', 'Rheumatoid Arthritis', 'Hyperthyroidism', 'Type 1 Diabetes']}
                    value={form.medical_conditions}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Medications"
                    name="medications"
                    options={['None', 'Corticosteroids']}
                    value={form.medications}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-6">
                Lifestyle
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Body Weight"
                    name="body_weight"
                    options={['Underweight', 'Normal', 'Overweight']}
                    value={form.body_weight}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Physical Activity"
                    name="physical_activity"
                    options={['Sedentary', 'Moderate', 'Active']}
                    value={form.physical_activity}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Smoking"
                    name="smoking"
                    options={['Yes', 'No']}
                    value={form.smoking}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Alcohol Consumption"
                    name="alcohol_consumption"
                    options={['None', 'Moderate', 'Frequent']}
                    value={form.alcohol_consumption}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Nutrition */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-6">
                Nutrition
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Calcium Intake"
                  name="calcium_intake"
                  options={['Low', 'Adequate']}
                  value={form.calcium_intake}
                  onChange={handleChange}
                />
                <SelectField
                  label="Vitamin D Intake"
                  name="vitamin_d_intake"
                  options={['Sufficient', 'Insufficient']}
                  value={form.vitamin_d_intake}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-6">
                Demographics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Race / Ethnicity"
                  name="race_ethnicity"
                  options={['Caucasian', 'African American', 'Asian']}
                  value={form.race_ethnicity}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Risk'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
