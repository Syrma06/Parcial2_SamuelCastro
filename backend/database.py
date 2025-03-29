from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey

db = SQLAlchemy()

def configure_database(app):
    # Configurar conexión a MySQL (usa tus credenciales)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://parcial_dev:P@rci@l_S3gur0_2023!@localhost/parcial_web_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    # Crear tablas si no existen
    with app.app_context():
        db.create_all()