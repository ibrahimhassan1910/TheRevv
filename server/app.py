from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

# Load environment variables from.env file
load_dotenv()

# Enable CORS
app = Flask(__name__, static_folder='static')
CORS(app)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///car_stats.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static'  # Directory where images will be stored
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://the_revv_db_user:wK6UORNdsx9LUGd0HLlxL1GpnwoVJ5Ab@dpg-cughuoaj1k6c73dukma0-a.oregon-postgres.render.com/the_revv_db'
app.secret_key = os.urandom(24)  # Random secret key for sessions

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# User model definition
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.name}>'

# Car model definition
class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    color = db.Column(db.String(20), nullable=False)
    make = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(200), nullable=False)
    video_url = db.Column(db.String(200), nullable=True)
    likes = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<Car {self.name}>'

# Initialize the database
with app.app_context():
    db.create_all()  # This creates the database tables if they don't exist

# Load user function for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Sign-up route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Check if the user already exists
    user_exists = User.query.filter_by(email=email).first()
    if user_exists:
        return jsonify({'message': 'User already exists!'}), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a new user and add it to the database
    new_user = User(name=name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User signed up successfully!'}), 201

# Sign-in route
@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Find user by email
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid email or password!'}), 401

    # Log in the user
    login_user(user)

    return jsonify({'message': 'User signed in successfully!'}), 200

# Logout route
@app.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully!'}), 200

# Car-related routes (same as before)
@app.route('/add-car', methods=['POST'])
@login_required
def add_car():
    # Retrieve data from the form
    name = request.form.get('name')
    model = request.form.get('model')
    year = request.form.get('year')
    color = request.form.get('color')
    make = request.form.get('make')
    description = request.form.get('description')
    video_url = request.form.get('video_url') 

   
    # Handle the image file
    image_file = request.files.get('image')
    if image_file and image_file.filename != '':
        # Ensure the file has a secure name
        filename = secure_filename(image_file.filename)
        # Save the image in the static folder
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(image_path)
        image_url = f"/static/{filename}" # Store thge full url in the database
    else:
        return jsonify({'message': 'Image file is required'}), 400

    # Check if all required fields are present
    if not all([name, model, year, color, make, description, image_url]):
        return jsonify({'message': 'Missing required fields'}), 400
    # Create a new Car object and add it to the database
    new_car = Car(
        name=name,
        model=model,
        year=year,
        color=color,
        make=make,
        description=description,
        image_url= filename,
        video_url=video_url
    )

    try:
        db.session.add(new_car)
        db.session.commit()
        return jsonify({'message': 'Car added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to add car', 'error': str(e)}), 500

# Route to add liking functionality to our car cards
@app.route('/like-car/<int:car_id>', methods=['POST'])
def like_car(car_id):
    car = Car.query.get(car_id)
    if car:
        if car.likes is None:
            car.likes = 0  # Initialize to 0 if it's None
        car.likes += 1
        db.session.commit()
        return jsonify({'message': 'Car liked!', 'likes': car.likes}), 200
    return jsonify({'message': 'Car not found'}), 404

#route to delete a car by it's id
@app.route('/delete-car/<int:car_id>', methods=['DELETE'])
def delete_car(car_id):
    # Retrieve the car with the given ID
    car = Car.query.get(car_id)
    if not car:
        return jsonify({'message': 'Car not found'}), 404

    try:
        # Delete the car from the database
        db.session.delete(car)
        db.session.commit()
        return jsonify({'message': 'Car deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete car', 'error': str(e)}), 500
# Route to check if the backend is running
@app.route('/')
def home():
    return "Backend is running"

# Dynamic route to serve car images
@app.route('/static/<path:filename>')
def serve_static_file(filename):
    return app.send_static_file(filename)

# Route to fetch all car stats
@app.route('/car-stats')
def car_stats():
    try:
        #Query all  cars from the database
        cars = Car.query.all()
        car_list = [
             {
                "id": car.id,
                "name": car.name,
                "model": car.model,
                "year": car.year,
                "color": car.color,
                "make": car.make,
                "description": car.description,
                "image_url": f"/static/{car.image_url}",
                "video_url": car.video_url if car.video_url else None,
                "likes": car.likes,
                "edit_link": f"/edit-car/{car.id}"
            }
                for car in cars
        ]  # List to store car stats

        return jsonify(car_list)  # Return JSON response
    except Exception as e:
        print("ERROR FETCHING CAR STATS:", e)  # Corrected print statement
        return jsonify({"error": "An error occurred while fetching car stats"}), 500
        
    

if __name__ == '__main__':
    app.run(debug=True)