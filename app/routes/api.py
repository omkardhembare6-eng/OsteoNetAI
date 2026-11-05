"""API routes for OPDoctorNet2 — prediction CRUD + simulator + model info."""

from flask import Blueprint, jsonify, request

from app.models.database import Patient, Prediction, db
from app.models.predictor import OsteoporosisPredictor

api = Blueprint("api", __name__)

# Lazy-loaded singleton predictor
_predictor: OsteoporosisPredictor | None = None


def _get_predictor() -> OsteoporosisPredictor:
    global _predictor
    if _predictor is None:
        _predictor = OsteoporosisPredictor()
    return _predictor


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  POST /api/predict
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@api.route("/api/predict", methods=["POST"])
def predict():
    """Accept patient features as JSON, run prediction, persist, and return result."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    # ── Required fields ──────────────────────────────────────────────
    required_fields = [
        "name", "Age", "Gender", "Hormonal Changes", "Family History",
        "Race/Ethnicity", "Body Weight", "Calcium Intake", "Vitamin D Intake",
        "Physical Activity", "Smoking", "Alcohol Consumption",
        "Medical Conditions", "Medications", "Prior Fractures",
    ]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        age = int(data["Age"])
    except (ValueError, TypeError):
        return jsonify({"error": "Age must be a number."}), 400

    # ── Run prediction ───────────────────────────────────────────────
    try:
        predictor = _get_predictor()
        result = predictor.predict(data)
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {str(exc)}"}), 500

    # ── Persist patient + prediction ─────────────────────────────────
    patient = Patient(
        name=data["name"],
        age=age,
        gender=data["Gender"],
    )
    db.session.add(patient)
    db.session.flush()  # get patient.id before committing

    prediction = Prediction(
        patient_id=patient.id,
        age=age,
        gender=data["Gender"],
        hormonal_changes=data["Hormonal Changes"],
        family_history=data["Family History"],
        race_ethnicity=data["Race/Ethnicity"],
        body_weight=data["Body Weight"],
        calcium_intake=data["Calcium Intake"],
        vitamin_d_intake=data["Vitamin D Intake"],
        physical_activity=data["Physical Activity"],
        smoking=data["Smoking"],
        alcohol_consumption=data["Alcohol Consumption"],
        medical_conditions=data["Medical Conditions"],
        medications=data["Medications"],
        prior_fractures=data["Prior Fractures"],
        risk_score=result["risk_score"],
        prediction=result["prediction"],
        risk_level=result["risk_level"],
    )
    db.session.add(prediction)
    db.session.commit()

    return jsonify({
        "id": prediction.id,
        "patient": patient.to_dict(),
        **result,
    }), 201


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  POST /api/simulate  (Before/After Simulator)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@api.route("/api/simulate", methods=["POST"])
def simulate():
    """Compare two scenarios — does NOT save to database.

    Request JSON:
    {
        "before": { ...patient fields... },
        "after":  { ...patient fields... }
    }
    """
    data = request.get_json(silent=True)
    if not data or "before" not in data or "after" not in data:
        return jsonify({"error": "Request must contain 'before' and 'after' objects."}), 400

    try:
        predictor = _get_predictor()
        result = predictor.simulate(data["before"], data["after"])
    except Exception as exc:
        return jsonify({"error": f"Simulation failed: {str(exc)}"}), 500

    return jsonify(result)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GET /api/predictions
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@api.route("/api/predictions", methods=["GET"])
def get_predictions():
    """Return all prediction records as JSON."""
    predictions = Prediction.query.order_by(Prediction.created_at.desc()).all()
    return jsonify([p.to_dict() for p in predictions])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GET /api/predictions/<id>
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@api.route("/api/predictions/<int:pred_id>", methods=["GET"])
def get_prediction(pred_id):
    """Return a single prediction by ID."""
    prediction = Prediction.query.get(pred_id)
    if prediction is None:
        return jsonify({"error": "Prediction not found."}), 404

    # Also return feature contributions for this prediction
    predictor = _get_predictor()
    pred_data = prediction.to_dict()

    # Re-run explanation on the stored inputs
    result = predictor.predict({
        "Age": prediction.age,
        "Physical Activity": prediction.physical_activity,
        "Hormonal Changes": prediction.hormonal_changes,
        "Prior Fractures": prediction.prior_fractures,
        "Body Weight": prediction.body_weight,
        "Race/Ethnicity": prediction.race_ethnicity,
        "Vitamin D Intake": prediction.vitamin_d_intake,
        "Smoking": prediction.smoking,
        "Gender": prediction.gender,
        "Family History": prediction.family_history,
        "Calcium Intake": prediction.calcium_intake,
        "Alcohol Consumption": prediction.alcohol_consumption,
        "Medical Conditions": prediction.medical_conditions,
        "Medications": prediction.medications,
    })
    pred_data["feature_contributions"] = result["feature_contributions"]

    return jsonify(pred_data)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DELETE /api/predictions/<id>
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@api.route("/api/predictions/<int:pred_id>", methods=["DELETE"])
def delete_prediction(pred_id):
    """Delete a prediction by ID."""
    prediction = Prediction.query.get(pred_id)
    if prediction is None:
        return jsonify({"error": "Prediction not found."}), 404

    db.session.delete(prediction)
    db.session.commit()
    return jsonify({"message": f"Prediction {pred_id} deleted."}), 200


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GET /api/stats  (Dashboard)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@api.route("/api/stats", methods=["GET"])
def get_stats():
    """Return dashboard statistics."""
    total = Prediction.query.count()
    high_risk = Prediction.query.filter_by(risk_level="High").count()
    medium_risk = Prediction.query.filter_by(risk_level="Medium").count()
    low_risk = Prediction.query.filter_by(risk_level="Low").count()
    return jsonify({
        "total_predictions": total,
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": low_risk,
        "model_accuracy": 89.29,
    })


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GET /api/model/info  (About Model Page)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@api.route("/api/model/info", methods=["GET"])
def model_info():
    """Return model metadata, accuracy metrics, and feature importances."""
    predictor = _get_predictor()
    return jsonify(predictor.get_model_info())


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GET /api/health
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@api.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "OsteoNet AI API"})
