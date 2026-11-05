"""Flask application factory for OPDoctorNet2."""

import os

from flask import Flask
from flask_cors import CORS

from app.config import config_by_name
from app.models.database import db
from app.routes.api import api


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure the Flask application.
i
    Parameters
    ----------
    config_name : str, optional
        One of ``'development'``, ``'production'``, or ``'default'``.
        Falls back to the ``FLASK_ENV`` env-var, then ``'default'``.
    """
    app = Flask(__name__)

    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "default")
    app.config.from_object(config_by_name[config_name])

    # Ensure the instance directory exists (for SQLite DB)
    instance_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "instance")
    os.makedirs(instance_path, exist_ok=True)

    # ── Extensions ───────────────────────────────────────────────────
    CORS(app)  # Allow Lovable frontend to call this API
    db.init_app(app)

    # ── Blueprints ───────────────────────────────────────────────────
    app.register_blueprint(api)

    # ── Create tables on first request ───────────────────────────────
    with app.app_context():
        db.create_all()

    return app
