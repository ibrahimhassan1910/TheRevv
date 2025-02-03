import { useState, useEffect } from 'react';
// import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const CarStat = () => {
    const [cars, setCars] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCars, setFilteredCars] = useState([]);
    const [selectedCar, setSelectedCar] = useState(null);
    const navigate = useNavigate ();

    useEffect(() => {
        // Fetch car stats from Flask backend
        fetch('http://localhost:5000/car-stats')
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            // Only update state if data has changed
            setCars((prevCars) => {
              if (JSON.stringify(prevCars) !== JSON.stringify(data)) {
                return data;
              }
              return prevCars; // Avoid setting state if data is the same
            });
            setFilteredCars(data); // Set filtered cars initially to all cars
          })
          .catch((error) => console.error('Error fetching car data:', error));
      }, []);

      const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = cars.filter((car) => 
          car.name.toLowerCase().includes(term) || 
          car.description.toLowerCase().includes(term)
        );
        setFilteredCars(filtered);
    };

    const handleCardClick = (car) => {
        setSelectedCar((prevSelected) => (prevSelected === car));
    };
    const handleLike = async (carId) => {
        try {
            const response = await fetch(`http://localhost:5000/like-car/${carId}`, {
                method: "POST",
            });

            if (response.ok) {
                const updatedCar = await response.json();

                // Update state to reflect new like count
                setCars((prevCars) =>
                    prevCars.map((car) =>
                        car.id === carId ? { ...car, likes: updatedCar.likes } : car
                    )
                );

                setFilteredCars((prevFilteredCars) =>
                    prevFilteredCars.map((car) =>
                        car.id === carId ? { ...car, likes: updatedCar.likes } : car
                    )
                );
            } else {
                console.error("Failed to like the car");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    
    const handleAddCarClick = () => {
      navigate('/add-car');
    };
    return (
        <div className="car-container">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search for a car..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            <div className="car-list">
                {filteredCars.map((car) => (
                    <div key={car.id} 
                    className="car-card"
                    onClick={() => handleCardClick(car)} // Set selected car on click
                    style={{ cursor: 'pointer' }}
                    >
                        <img src={`http://localhost:5000${car.image_url}`} alt={car.name} className="car-image" />
                        <h2>{car.name}</h2>
                        <p>{car.description}</p>
                        <button className="like-button" onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering video toggle
                            handleLike(car.id);
                        }}>
                            ❤️ Like ({car.likes || 0})
                        </button>
                        {selectedCar === car && car.video_url && (
                            <div className="video-container">
                                <iframe
                                    width="560"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${car.video_url}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>
                    
                ))}
            </div>
            <button
            onClick={handleAddCarClick}
            style={{
            position: 'fixed',
           bottom: '20px',
           left: '50%',
           transform: 'translateX(-50%)',
           zIndex: 1000, // To ensure button appears above other content
        }}
      >
        Add Car
      </button>
        </div>
    );
};

export default CarStat;