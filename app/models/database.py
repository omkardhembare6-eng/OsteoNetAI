"""SQLAlchemy database models for OPDoctorNet2."""

from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Patient(db.Model):
    """Patient information model."""

    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    predictions = db.relationship("Prediction", backref="patient", lazy=True, cascade="all, delete-orphan")

    def __init__(self, name: str = "", age: int = 0, gender: str = "", **kwargs):
        super().__init__(name=name, age=age, gender=gender, **kwargs)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Prediction(db.Model):
    """Osteoporosis risk prediction model."""

    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)

    # ── Input features ──────────────────────────────────────────────────
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    hormonal_changes = db.Column(db.String(30), nullable=False)
    family_history = db.Column(db.String(5), nullable=False)
    race_ethnicity = db.Column(db.String(30), nullable=False)
    body_weight = db.Column(db.String(20), nullable=False)
    calcium_intake = db.Column(db.String(20), nullable=False)
    vitamin_d_intake = db.Column(db.String(20), nullable=False)
    physical_activity = db.Column(db.String(20), nullable=False)
    smoking = db.Column(db.String(5), nullable=False)
    alcohol_consumption = db.Column(db.String(20), nullable=False)
    medical_conditions = db.Column(db.String(30), nullable=False)
    medications = db.Column(db.String(30), nullable=False)
    prior_fractures = db.Column(db.String(5), nullable=False)

    # ── Prediction results ──────────────────────────────────────────────
    risk_score = db.Column(db.Float, nullable=False)
    prediction = db.Column(db.Integer, nullable=False)          # 0 or 1
    risk_level = db.Column(db.String(10), nullable=False)       # Low / Medium / High

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __init__(
        self,
        patient_id: int = 0,
        age: int = 0,
        gender: str = "",
        hormonal_changes: str = "",
        family_history: str = "",
        race_ethnicity: str = "",
        body_weight: str = "",
        calcium_intake: str = "",
        vitamin_d_intake: str = "",
        physical_activity: str = "",
        smoking: str = "",
        alcohol_consumption: str = "",
        medical_conditions: str = "",
        medications: str = "",
        prior_fractures: str = "",
        risk_score: float = 0.0,
        prediction: int = 0,
        risk_level: str = "",
        **kwargs,
    ):
        super().__init__(
            patient_id=patient_id,
            age=age,
            gender=gender,
            hormonal_changes=hormonal_changes,
            family_history=family_history,
            race_ethnicity=race_ethnicity,
            body_weight=body_weight,
            calcium_intake=calcium_intake,
            vitamin_d_intake=vitamin_d_intake,
            physical_activity=physical_activity,
            smoking=smoking,
            alcohol_consumption=alcohol_consumption,
            medical_conditions=medical_conditions,
            medications=medications,
            prior_fractures=prior_fractures,
            risk_score=risk_score,
            prediction=prediction,
            risk_level=risk_level,
            **kwargs,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "patient": self.patient.to_dict() if self.patient else None,
            "age": self.age,
            "gender": self.gender,
            "hormonal_changes": self.hormonal_changes,
            "family_history": self.family_history,
            "race_ethnicity": self.race_ethnicity,
            "body_weight": self.body_weight,
            "calcium_intake": self.calcium_intake,
            "vitamin_d_intake": self.vitamin_d_intake,
            "physical_activity": self.physical_activity,
            "smoking": self.smoking,
            "alcohol_consumption": self.alcohol_consumption,
            "medical_conditions": self.medical_conditions,
            "medications": self.medications,
            "prior_fractures": self.prior_fractures,
            "risk_score": self.risk_score,
            "prediction": self.prediction,
            "risk_level": self.risk_level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
