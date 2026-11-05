const API_BASE = '/api';

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  created_at: string;
}

export interface FeatureContribution {
  feature: string;
  label: string;
  value: number;
  contribution_percent: number;
  impact: 'increases' | 'decreases' | 'neutral';
}

export interface PredictionResult {
  id: number;
  patient: Patient;
  prediction: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  feature_contributions: FeatureContribution[];
}

export interface PredictionRecord {
  id: number;
  patient_id: number;
  patient: Patient;
  age: number;
  gender: string;
  hormonal_changes: string;
  family_history: string;
  race_ethnicity: string;
  body_weight: string;
  calcium_intake: string;
  vitamin_d_intake: string;
  physical_activity: string;
  smoking: string;
  alcohol_consumption: string;
  medical_conditions: string;
  medications: string;
  prior_fractures: string;
  risk_score: number;
  prediction: number;
  risk_level: string;
  created_at: string;
  feature_contributions?: FeatureContribution[];
}

export interface Stats {
  total_predictions: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  model_accuracy: number;
}

export interface SimulationResult {
  before: { risk_score: number; risk_level: string; prediction: number };
  after: { risk_score: number; risk_level: string; prediction: number };
  risk_change: number;
  risk_change_percent: number;
  changes: { feature: string; label: string; before: number; after: number }[];
}

export interface ModelInfo {
  model_name: string;
  model_type: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  cv_accuracy: number;
  cv_std: number;
  dataset_samples: number;
  dataset_features: number;
  top_features_used: number;
  test_split: string;
  description: string;
  feature_importances: { feature: string; label: string; importance: number; importance_percent: number }[];
  risk_levels: Record<string, string>;
}

export const api = {
  async getStats(): Promise<Stats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async predict(data: Record<string, string | number>): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Prediction failed');
    }
    return res.json();
  },

  async getPredictions(): Promise<PredictionRecord[]> {
    const res = await fetch(`${API_BASE}/predictions`);
    if (!res.ok) throw new Error('Failed to fetch predictions');
    return res.json();
  },

  async getPrediction(id: number): Promise<PredictionRecord> {
    const res = await fetch(`${API_BASE}/predictions/${id}`);
    if (!res.ok) throw new Error('Prediction not found');
    return res.json();
  },

  async deletePrediction(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/predictions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
  },

  async simulate(before: Record<string, string | number>, after: Record<string, string | number>): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ before, after }),
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  },

  async getModelInfo(): Promise<ModelInfo> {
    const res = await fetch(`${API_BASE}/model/info`);
    if (!res.ok) throw new Error('Failed to fetch model info');
    return res.json();
  },
};

