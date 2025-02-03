import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CarStat from './CarStat';
import AddCar from './AddCar';
import Signup from './Signup';
import Signin from './Signin';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token); // Set login state based on token existence
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/car-stats" /> : <Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/car-stats" element={isLoggedIn ? <CarStat /> : <Navigate to="/signup" />} />
        <Route path="/add-car" element={ <AddCar /> } />
      </Routes>
    </Router>
  );
}

export default App;
