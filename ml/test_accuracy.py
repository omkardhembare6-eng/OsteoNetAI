"""
OPDoctorNet XGBoost Model - Accuracy Testing Script
====================================================
Tests the saved XGBoost model on the osteoporosis dataset using
an 80/20 train-test split with comprehensive evaluation metrics.
"""

import pickle
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score, roc_curve,
    average_precision_score, precision_recall_curve
)
import os

# ─── Configuration ───────────────────────────────────────────────
DATA_PATH = "osteoporosis.csv"
MODEL_PATH = "OPDoctorNet_XGBoost_Top10.pkl"
FEATURES_PATH = "OPDoctorNet_Top10_features.pkl"
OUTPUT_DIR = "accuracy_results"
RANDOM_STATE = 42

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── 1. Load data, model, and features ──────────────────────────
print("=" * 60)
print("OPDoctorNet XGBoost Model — Accuracy Evaluation")
print("=" * 60)

df = pd.read_csv(DATA_PATH)
print(f"\nDataset shape: {df.shape}")
print(f"Target distribution:\n{df['Osteoporosis'].value_counts()}")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)
with open(FEATURES_PATH, "rb") as f:
    top10_features = pickle.load(f)

print(f"\nTop-10 features used by the model:")
for i, feat in enumerate(top10_features, 1):
    print(f"  {i}. {feat}")

# ─── 2. Preprocess (one-hot encode to match training) ───────────
target = "Osteoporosis"
drop_cols = ["Id"]
X = df.drop(columns=[target] + drop_cols, errors="ignore")
y = df[target]

# One-hot encode categorical columns
X_encoded = pd.get_dummies(X)

# Keep only the top-10 features the model expects
missing = [f for f in top10_features if f not in X_encoded.columns]
if missing:
    print(f"\n⚠  Missing features (will be zero-filled): {missing}")
    for col in missing:
        X_encoded[col] = 0

X_final = X_encoded[top10_features]

# ─── 3. Train-test split ────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_final, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
)
print(f"\nTrain size: {len(X_train)}  |  Test size: {len(X_test)}")

# ─── 4. Predictions ─────────────────────────────────────────────
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

# ─── 5. Metrics ─────────────────────────────────────────────────
acc   = accuracy_score(y_test, y_pred)
prec  = precision_score(y_test, y_pred)
rec   = recall_score(y_test, y_pred)
f1    = f1_score(y_test, y_pred)
auc   = roc_auc_score(y_test, y_proba)
ap    = average_precision_score(y_test, y_proba)

print("\n" + "─" * 60)
print("TEST SET METRICS")
print("─" * 60)
print(f"  Accuracy            : {acc:.4f}  ({acc*100:.2f}%)")
print(f"  Precision           : {prec:.4f}")
print(f"  Recall (Sensitivity): {rec:.4f}")
print(f"  F1-Score            : {f1:.4f}")
print(f"  ROC-AUC             : {auc:.4f}")
print(f"  Avg Precision (AP)  : {ap:.4f}")
print("─" * 60)

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["No Osteoporosis", "Osteoporosis"]))

# ─── 6. Cross-Validation (5-fold stratified) ────────────────────
print("Running 5-fold stratified cross-validation...")
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
cv_scores = cross_val_score(model, X_final, y, cv=skf, scoring="accuracy")
print(f"\n  CV Accuracy scores : {cv_scores}")
print(f"  CV Mean Accuracy   : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# ─── 7. Confusion Matrix Plot ───────────────────────────────────
cm = confusion_matrix(y_test, y_pred)
fig, axes = plt.subplots(1, 3, figsize=(20, 5))

# (a) Confusion Matrix
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=["No Osteoporosis", "Osteoporosis"],
            yticklabels=["No Osteoporosis", "Osteoporosis"],
            ax=axes[0])
axes[0].set_xlabel("Predicted")
axes[0].set_ylabel("Actual")
axes[0].set_title("Confusion Matrix")

# (b) ROC Curve
fpr, tpr, _ = roc_curve(y_test, y_proba)
axes[1].plot(fpr, tpr, color="darkorange", lw=2, label=f"AUC = {auc:.4f}")
axes[1].plot([0, 1], [0, 1], "k--", lw=1)
axes[1].set_xlabel("False Positive Rate")
axes[1].set_ylabel("True Positive Rate")
axes[1].set_title("ROC Curve")
axes[1].legend(loc="lower right")
axes[1].grid(alpha=0.3)

# (c) Precision-Recall Curve
prec_curve, rec_curve, _ = precision_recall_curve(y_test, y_proba)
axes[2].plot(rec_curve, prec_curve, color="navy", lw=2, label=f"AP = {ap:.4f}")
axes[2].set_xlabel("Recall")
axes[2].set_ylabel("Precision")
axes[2].set_title("Precision-Recall Curve")
axes[2].legend(loc="lower left")
axes[2].grid(alpha=0.3)

plt.tight_layout()
plot_path = os.path.join(OUTPUT_DIR, "model_evaluation.png")
plt.savefig(plot_path, dpi=150)
print(f"\n📊 Evaluation plots saved to: {plot_path}")

# ─── 8. Summary to file ─────────────────────────────────────────
summary_path = os.path.join(OUTPUT_DIR, "accuracy_summary.txt")
with open(summary_path, "w") as f:
    f.write("OPDoctorNet XGBoost Model — Accuracy Summary\n")
    f.write("=" * 50 + "\n\n")
    f.write(f"Dataset         : {DATA_PATH}\n")
    f.write(f"Samples         : {len(df)}\n")
    f.write(f"Test split      : 20%  ({len(X_test)} samples)\n\n")
    f.write("Test Set Metrics\n")
    f.write("-" * 40 + "\n")
    f.write(f"Accuracy         : {acc:.4f}\n")
    f.write(f"Precision        : {prec:.4f}\n")
    f.write(f"Recall           : {rec:.4f}\n")
    f.write(f"F1-Score         : {f1:.4f}\n")
    f.write(f"ROC-AUC          : {auc:.4f}\n")
    f.write(f"Avg Precision    : {ap:.4f}\n\n")
    f.write("5-Fold CV Accuracy\n")
    f.write("-" * 40 + "\n")
    f.write(f"Scores           : {cv_scores}\n")
    f.write(f"Mean ± Std       : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}\n\n")
    f.write("Classification Report\n")
    f.write("-" * 40 + "\n")
    f.write(classification_report(y_test, y_pred,
                                  target_names=["No Osteoporosis", "Osteoporosis"]))
print(f"📝 Summary saved to: {summary_path}")
print("\n✅ Done!")

