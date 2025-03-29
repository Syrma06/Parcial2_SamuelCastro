from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from .models import Usuario, Producto
from .database import db, configure_database
import bcrypt

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secreta-2023'  # Cambia esto en producción
jwt = JWTManager(app)

# Configurar base de datos
configure_database(app)

# --- Endpoints de Autenticación ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    # Validar campos
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    # Hashear contraseña
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    # Crear usuario
    nuevo_usuario = Usuario(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password.decode('utf-8')
    )
    
    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({"message": "Usuario registrado exitosamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "El email o usuario ya existen"}), 409

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    usuario = Usuario.query.filter_by(email=data['email']).first()

    if not usuario or not bcrypt.checkpw(data['password'].encode('utf-8'), usuario.password_hash.encode('utf-8')):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Generar token JWT
    token = create_access_token(identity=usuario.id)
    return jsonify({"token": token}), 200

# --- Endpoints de Productos (Protegidos) ---
@app.route('/api/products', methods=['GET', 'POST'])
@jwt_required()
def manage_products():
    usuario_id = get_jwt_identity()
    
    if request.method == 'GET':
        productos = Producto.query.filter_by(usuario_id=usuario_id).all()
        return jsonify([{
            "id": p.id,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "precio": str(p.precio)
        } for p in productos]), 200
    
    elif request.method == 'POST':
        data = request.get_json()
        nuevo_producto = Producto(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            precio=data['precio'],
            usuario_id=usuario_id
        )
        db.session.add(nuevo_producto)
        db.session.commit()
        return jsonify({"message": "Producto creado"}), 201

@app.route('/api/products/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def single_product(id):
    usuario_id = get_jwt_identity()
    producto = Producto.query.filter_by(id=id, usuario_id=usuario_id).first()

    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    if request.method == 'PUT':
        data = request.get_json()
        producto.nombre = data.get('nombre', producto.nombre)
        producto.descripcion = data.get('descripcion', producto.descripcion)
        producto.precio = data.get('precio', producto.precio)
        db.session.commit()
        return jsonify({"message": "Producto actualizado"}), 200
    
    elif request.method == 'DELETE':
        db.session.delete(producto)
        db.session.commit()
        return jsonify({"message": "Producto eliminado"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)