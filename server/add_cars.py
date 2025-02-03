from app import app, db, Car

with app.app_context():
# Create car instances
    car1 = Car(name="Yellow Lemans Ferrari", model="2023", year=2023, color="Yellow", make="Ferrari", description="A 2023 Ferrari sports car.", image_url="yellow-lemans-ferrari.jpg")
    car2 = Car(name="Red Porsche 911", model="2022", year=2022, color="Red", make="Porsche", description="The iconic Porsche 911 in a stunning red finish.", image_url="red-porsche-911.jpg")
    car3 = Car(name="White Formula 1", model="2024", year=2024, color="White", make="RB", description="The iconic Porsche 911 in a stunning red finish.", image_url="RedBull F1 Special White Japan Livery 2024.jpg")

# Add cars to the database
    db.session.add(car1)
    db.session.add(car2)
    db.session.commit()

#Find duplicate cars bt name,model, amd year
    unique_cars = {}

    cars = Car.query.all()
    for car in cars:
        #create a unique key based on car name,model and year
        car_key = (car.name, car.model, car.year)
        print(car.image_url)

        #if the car is already in unique_cars, delete the car (duplicate)
        if car_key in unique_cars:
            db.session.delete(car)

        else:
            unique_cars[car_key] = car


# query all cars
    cars = Car.query.all()
    for car in cars:
        print(car.name)