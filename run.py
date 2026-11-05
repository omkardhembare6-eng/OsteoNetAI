"""Entry point for OPDoctorNet2 Flask application."""

from app.app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
