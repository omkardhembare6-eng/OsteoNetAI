"""ML predictor that loads the trained XGBoost model and runs inference."""

import os
import pickle

import numpy as np
import pandas as pd


# Human-readable labels for the 10 features
FEATURE_LABELS = {
    "Age": "Age",
    "Physical Activity_Active": "Physical Activity (Active)",
    "Hormonal Changes_Normal": "Hormonal Changes (Normal)",
    "Prior Fractures_No": "No Prior Fractures",
    "Body Weight_Normal": "Normal Body Weight",
    "Race/Ethnicity_Caucasian": "Race (Caucasian)",
    "Race/Ethnicity_African American": "Race (African American)",
    "Vitamin D Intake_Insufficient": "Vitamin D (Insufficient)",
    "Smoking_No": "Non-Smoker",
    "Race/Ethnicity_Asian": "Race (Asian)",
}

# Healthy baseline values for "what-if" comparisons
HEALTHY_BASELINE = {
    "Age": 30,
    "Gender": "Female",
    "Hormonal Changes": "Normal",
    "Family History": "No",
    "Race/Ethnicity": "Caucasian",
    "Body Weight": "Normal",
    "Calcium Intake": "Adequate",
    "Vitamin D Intake": "Sufficient",
    "Physical Activity": "Active",
    "Smoking": "No",
    "Alcohol Consumption": "None",
    "Medical Conditions": "None",
    "Medications": "None",
    "Prior Fractures": "No",
}


class OsteoporosisPredictor:
    """Wraps the trained XGBoost model for osteoporosis risk prediction.

    The model was trained on one-hot-encoded data and uses only the top-10
    features.  This class converts raw form inputs (matching the original CSV
    columns) into that same one-hot representation before calling
    ``model.predict_proba``.
    """

    def __init__(self, model_path: str | None = None, features_path: str | None = None):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir))

        if model_path is None:
            model_path = os.path.join(base_dir, "ml", "OPDoctorNet_XGBoost_Top10.pkl")
        if features_path is None:
            features_path = os.path.join(base_dir, "ml", "OPDoctorNet_Top10_features.pkl")

        with open(model_path, "rb") as f:
            self.model = pickle.load(f)

        with open(features_path, "rb") as f:
            self.features: list[str] = pickle.load(f)

    # ------------------------------------------------------------------ #
    #  Public API                                                         #
    # ------------------------------------------------------------------ #

    def predict(self, form_data: dict) -> dict:
        """Run a prediction from raw form inputs.

        Returns
        -------
        dict
            prediction, risk_score, risk_level, and feature_contributions.
        """
        encoded = self._encode(form_data)
        df = pd.DataFrame([encoded], columns=self.features)

        risk_score = float(self.model.predict_proba(df)[0][1])
        prediction = int(self.model.predict(df)[0])
        risk_level = self._risk_level(risk_score)

        # Feature contribution breakdown
        contributions = self._explain(encoded)

        return {
            "prediction": prediction,
            "risk_score": round(risk_score, 4),
            "risk_level": risk_level,
            "feature_contributions": contributions,
        }

    def simulate(self, before_data: dict, after_data: dict) -> dict:
        """Compare two scenarios side-by-side (before/after simulator).

        Parameters
        ----------
        before_data : dict
            Original patient input values.
        after_data : dict
            Modified "what-if" patient input values.

        Returns
        -------
        dict
            Both predictions + list of changed factors.
        """
        before_enc = self._encode(before_data)
        after_enc = self._encode(after_data)

        df_before = pd.DataFrame([before_enc], columns=self.features)
        df_after = pd.DataFrame([after_enc], columns=self.features)

        score_before = float(self.model.predict_proba(df_before)[0][1])
        score_after = float(self.model.predict_proba(df_after)[0][1])

        # Identify which factors changed
        changes = []
        for i, feat in enumerate(self.features):
            if before_enc[i] != after_enc[i]:
                changes.append({
                    "feature": feat,
                    "label": FEATURE_LABELS.get(feat, feat),
                    "before": before_enc[i],
                    "after": after_enc[i],
                })

        return {
            "before": {
                "risk_score": round(score_before, 4),
                "risk_level": self._risk_level(score_before),
                "prediction": int(self.model.predict(df_before)[0]),
            },
            "after": {
                "risk_score": round(score_after, 4),
                "risk_level": self._risk_level(score_after),
                "prediction": int(self.model.predict(df_after)[0]),
            },
            "risk_change": round(score_after - score_before, 4),
            "risk_change_percent": round((score_after - score_before) * 100, 2),
            "changes": changes,
        }

    def get_model_info(self) -> dict:
        """Return model metadata for the About page."""
        importances = self.model.feature_importances_
        feature_importance_list = []
        for feat, imp in sorted(zip(self.features, importances), key=lambda x: -x[1]):
            feature_importance_list.append({
                "feature": feat,
                "label": FEATURE_LABELS.get(feat, feat),
                "importance": round(float(imp), 4),
                "importance_percent": round(float(imp) * 100, 2),
            })
        return {
            "model_name": "OsteoNet AI XGBoost",
            "model_type": "XGBoost Classifier",
            "version": "1.0",
            "accuracy": 0.8929,
            "precision": 0.9936,
            "recall": 0.7908,
            "f1_score": 0.8807,
            "roc_auc": 0.9329,
            "cv_accuracy": 0.9050,
            "cv_std": 0.014,
            "dataset_samples": 1958,
            "dataset_features": 14,
            "top_features_used": 10,
            "test_split": "20%",
            "feature_importances": feature_importance_list,
            "description": (
                "OsteoNet AI uses an XGBoost classifier trained on 1,958 patient records "
                "to predict osteoporosis risk. The model uses the top 10 most predictive "
                "features selected from 14 clinical and lifestyle factors."
            ),
            "risk_levels": {
                "Low": "Risk score below 30% — low probability of osteoporosis.",
                "Medium": "Risk score 30-70% — moderate probability, further screening recommended.",
                "High": "Risk score above 70% — high probability, clinical evaluation strongly recommended.",
            },
        }

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                   #
    # ------------------------------------------------------------------ #

    def _encode(self, data: dict) -> list[float]:
        """Map raw form data to the 10-feature vector the model expects."""
        age = float(data.get("Age", data.get("age", 0)))

        physical_activity = data.get("Physical Activity", data.get("physical_activity", ""))
        hormonal_changes = data.get("Hormonal Changes", data.get("hormonal_changes", ""))
        prior_fractures = data.get("Prior Fractures", data.get("prior_fractures", ""))
        body_weight = data.get("Body Weight", data.get("body_weight", ""))
        race_ethnicity = data.get("Race/Ethnicity", data.get("race_ethnicity", ""))
        vitamin_d_intake = data.get("Vitamin D Intake", data.get("vitamin_d_intake", ""))
        smoking = data.get("Smoking", data.get("smoking", ""))

        encoded = [
            age,
            1.0 if physical_activity == "Active" else 0.0,
            1.0 if hormonal_changes == "Normal" else 0.0,
            1.0 if prior_fractures == "No" else 0.0,
            1.0 if body_weight == "Normal" else 0.0,
            1.0 if race_ethnicity == "Caucasian" else 0.0,
            1.0 if race_ethnicity == "African American" else 0.0,
            1.0 if vitamin_d_intake == "Insufficient" else 0.0,
            1.0 if smoking == "No" else 0.0,
            1.0 if race_ethnicity == "Asian" else 0.0,
        ]

        return encoded

    def _risk_level(self, score: float) -> str:
        """Map a risk score to Low / Medium / High."""
        if score < 0.3:
            return "Low"
        elif score <= 0.7:
            return "Medium"
        return "High"

    def _explain(self, encoded: list[float]) -> list[dict]:
        """Calculate each feature's contribution to the prediction.

        Uses model feature importances weighted by the encoded values
        to produce a human-readable breakdown.
        """
        importances = self.model.feature_importances_
        # Normalize age to 0-1 range (20-90) for fair comparison
        norm_encoded = list(encoded)
        norm_encoded[0] = max(0.0, min((encoded[0] - 20) / 70, 1.0))

        weighted = [abs(float(v) * float(imp)) for v, imp in zip(norm_encoded, importances)]
        total = sum(weighted) if sum(weighted) > 0 else 1.0

        contributions = []
        for i, feat in enumerate(self.features):
            pct = round(float(weighted[i] / total) * 100, 1)
            # Determine if this factor increases or decreases risk
            if feat == "Age":
                impact = "increases" if encoded[0] > 50 else "decreases"
            elif feat in ("Hormonal Changes_Normal", "Prior Fractures_No",
                          "Body Weight_Normal", "Smoking_No",
                          "Physical Activity_Active"):
                # These are "protective" when = 1
                impact = "decreases" if encoded[i] == 1.0 else "increases"
            elif feat == "Vitamin D Intake_Insufficient":
                impact = "increases" if encoded[i] == 1.0 else "decreases"
            else:
                impact = "neutral"

            contributions.append({
                "feature": feat,
                "label": FEATURE_LABELS.get(feat, feat),
                "value": float(encoded[i]),
                "contribution_percent": float(pct),
                "impact": impact,
            })

        # Sort by contribution (highest first)
        contributions.sort(key=lambda x: x["contribution_percent"], reverse=True)
        return contributions
