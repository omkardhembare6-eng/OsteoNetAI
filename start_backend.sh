#!/bin/bash
# OsteoNet AI — Start Backend Server
# This script automatically sets the library path for XGBoost

cd "$(dirname "$0")"

export DYLD_LIBRARY_PATH="/Library/Frameworks/Python.framework/Versions/3.15/lib/python3.15/site-packages/sklearn/.dylibs"

echo "🦴 Starting OsteoNet AI Backend..."
echo "   Server: http://localhost:5001"
echo ""

./venv/bin/python run.py

