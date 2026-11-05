#!/bin/bash
# OsteoNet AI — Start Frontend Server

cd "$(dirname "$0")/frontend"

echo "🎨 Starting OsteoNet AI Frontend..."
echo "   App: http://localhost:3000"
echo ""

npx vite --port 3000

