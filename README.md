# 🦴 OsteoNet AI — AI-Powered Osteoporosis Risk Prediction System

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-green?logo=flask)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-orange)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)
![Three.js](https://img.shields.io/badge/Three.js-3D-black?logo=threedotjs)

A full-stack clinical decision support system that predicts **osteoporosis risk** using a trained **XGBoost machine learning model** with **89.29% accuracy**. Features a modern React frontend with 3D DNA helix visualization, risk factor breakdown charts, PDF report generation, and dark mode.

---

## 📸 Screenshots

| Dashboard | Predict Form | Result Page |
|-----------|-------------|-------------|
| Hero section with 3D DNA helix, stats cards, recent predictions | Manual input or CSV batch upload | Risk score circle, feature breakdown chart, PDF download |

---

## 🏗️ Project Structure

```
OsteoNet AI2/
├── app/                        # Flask Backend
│   ├── __init__.py
│   ├── app.py                  # Flask app factory (CORS, SQLAlchemy)
│   ├── config.py               # Database & app configuration
│   ├── models/
│   │   ├── database.py         # Patient & Prediction SQLAlchemy models
│   │   └── predictor.py        # XGBoost model wrapper & feature encoding
│   └── routes/
│       └── api.py              # REST API endpoints
│
├── frontend/                   # React Frontend
│   ├── public/
│   │   ├── bone.svg            # Favicon
│   │   └── sample_patients.csv # Example CSV for batch predictions
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.tsx      # Navigation bar with dark mode toggle
│   │   │   ├── Footer.tsx      # Footer
│   │   │   ├── HeroScene.tsx   # Three.js 3D DNA helix animation
│   │   │   ├── RiskCircle.tsx  # Animated risk score circle
│   │   │   ├── StatsCard.tsx   # Dashboard stat cards
│   │   │   ├── CsvUpload.tsx   # CSV drag-and-drop uploader
│   │   │   └── FeatureChart.tsx# Risk factor contribution chart
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.tsx   # Home page with stats & recent predictions
│   │   │   ├── Predict.tsx     # Prediction form (manual + CSV)
│   │   │   ├── Result.tsx      # Prediction result with PDF download
│   │   │   ├── History.tsx     # All predictions with search & filter
│   │   │   └── About.tsx       # Model info, metrics, feature importance
│   │   ├── lib/
│   │   │   └── api.ts          # API service layer (fetch wrapper)
│   │   ├── App.tsx             # Router & layout
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Tailwind CSS imports
│   ├── package.json
│   ├── vite.config.ts          # Vite config with API proxy
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── ml/                         # Machine Learning
│   ├── OsteoNet AI_XGBoost_Top10.pkl   # Trained XGBoost model
│   ├── OsteoNet AI_Top10_features.pkl  # Top 10 feature names
│   └── test_accuracy.py               # Model evaluation script
│
├── data/
│   └── osteoporosis.csv        # Original dataset (1,958 samples)
│
├── instance/
│   └── opdoctornet.db          # SQLite database (auto-created)
│
├── run.py                      # Backend entry point
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔮 **Risk Prediction** | Predicts Normal vs Osteoporosis using 15 clinical features |
| 📊 **Risk Factor Breakdown** | Visual chart showing why the prediction was made |
| 📄 **PDF Report Download** | Professional clinical report with patient details |
| 📁 **CSV Batch Upload** | Upload multiple patients at once for bulk prediction |
| 🔄 **Before/After Simulator** | Compare risk when changing lifestyle factors |
| 🌙 **Dark Mode** | Full dark mode support across all pages |
| 🧬 **3D DNA Helix** | Three.js animated visualization on dashboard |
| ℹ️ **About Model Page** | Model accuracy (89.29%), feature importances, dataset info |
| 🔍 **Search & Filter History** | Search by patient name, filter by risk level |
| 🗑️ **Delete Predictions** | Remove old predictions with confirmation modal |

---

## 🤖 Model Details

| Metric | Value |
|--------|-------|
| **Algorithm** | XGBoost Classifier |
| **Accuracy** | 89.29% |
| **Precision** | 99.36% |
| **Recall** | 79.08% |
| **F1-Score** | 88.07% |
| **ROC-AUC** | 93.29% |
| **Cross-Validation** | 90.50% ± 1.40% |
| **Dataset** | 1,958 samples (balanced 979/979) |
| **Features Used** | Top 10 of 14 original features |

### Top 10 Features
1. Age
2. Physical Activity (Active)
3. Hormonal Changes (Normal)
4. Prior Fractures (No)
5. Body Weight (Normal)
6. Race/Ethnicity (Caucasian)
7. Race/Ethnicity (African American)
8. Vitamin D Intake (Insufficient)
9. Smoking (No)
10. Race/Ethnicity (Asian)

---

## 🚀 How to Run

### Prerequisites

- **Python 3.10+** installed
- **Node.js 18+** installed
- **npm** or **yarn**

### Step 1: Clone / Download the project

```bash
cd ~/Desktop/OsteoNet AI2
```

### Step 2: Set up Backend (Python)

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS / Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Start Backend Server

```bash
# macOS (XGBoost needs libomp):
DYLD_LIBRARY_PATH="$(python -c 'import sklearn; import os; print(os.path.join(os.path.dirname(sklearn.__file__), ".dylibs"))')" python run.py

# Linux / Windows:
python run.py
```

The backend will start on **http://localhost:5001**

### Step 4: Set up Frontend (React)

Open a **new terminal**:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on **http://localhost:3000**

### Step 5: Open the App 🎉

Open your browser and go to: **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/stats` | Dashboard statistics |
| `POST` | `/api/predict` | Run a prediction |
| `POST` | `/api/simulate` | Before/After risk comparison |
| `GET` | `/api/predictions` | List all predictions |
| `GET` | `/api/predictions/:id` | Get single prediction with feature contributions |
| `DELETE` | `/api/predictions/:id` | Delete a prediction |
| `GET` | `/api/model/info` | Model metadata & feature importances |

### Example Prediction Request

```bash
curl -X POST http://localhost:5001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "Age": 65,
    "Gender": "Female",
    "Hormonal Changes": "Postmenopausal",
    "Family History": "Yes",
    "Race/Ethnicity": "Asian",
    "Body Weight": "Underweight",
    "Calcium Intake": "Low",
    "Vitamin D Intake": "Insufficient",
    "Physical Activity": "Sedentary",
    "Smoking": "Yes",
    "Alcohol Consumption": "Moderate",
    "Medical Conditions": "Rheumatoid Arthritis",
    "Medications": "Corticosteroids",
    "Prior Fractures": "Yes"
  }'
```

---

## 📁 CSV Upload Format

Use the included [sample_patients.csv](frontend/public/sample_patients.csv) as a template. Required columns:

```
Name, Age, Gender, Hormonal Changes, Family History, Race/Ethnicity,
Body Weight, Calcium Intake, Vitamin D Intake, Physical Activity,
Smoking, Alcohol Consumption, Medical Conditions, Medications, Prior Fractures
```

### Valid Values

| Field | Options |
|-------|---------|
| Gender | Male, Female |
| Hormonal Changes | Normal, Postmenopausal, Estrogen Deficiency |
| Family History | Yes, No |
| Race/Ethnicity | Caucasian, African American, Asian |
| Body Weight | Underweight, Normal, Overweight |
| Calcium Intake | Low, Adequate |
| Vitamin D Intake | Sufficient, Insufficient |
| Physical Activity | Sedentary, Moderate, Active |
| Smoking | Yes, No |
| Alcohol Consumption | None, Moderate, Frequent |
| Medical Conditions | None, Rheumatoid Arthritis, Hyperthyroidism, Type 1 Diabetes |
| Medications | None, Corticosteroids |
| Prior Fractures | Yes, No |

---

## 🛠️ Tech Stack

### Backend
- **Flask** — Python web framework
- **Flask-SQLAlchemy** — ORM for SQLite database
- **Flask-CORS** — Cross-origin resource sharing
- **XGBoost** — Machine learning model
- **scikit-learn** — ML utilities
- **Pandas / NumPy** — Data processing

### Frontend
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool & dev server
- **Tailwind CSS** — Utility-first styling
- **Three.js / React Three Fiber** — 3D DNA helix animation
- **Recharts** — Charts for feature importance
- **jsPDF** — PDF report generation
- **PapaParse** — CSV file parsing
- **Lucide React** — Icon library
- **React Router** — Client-side routing

---

## 📝 License

This project is for educational and research purposes.

---

## 👨‍💻 Author

Built with ❤️ for osteoporosis risk prediction research.

