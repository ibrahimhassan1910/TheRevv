import { useState } from 'react';
import './App.css';
import CarStats from './CarStat';

function Signup() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
  });
  const [signedUp, setSignedUp] = useState(false); // Track sign-up status
  const [errorMessage, setErrorMessage] = useState(''); // For error handling

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.password === user.confirmPassword) {
      // Send sign-up data to the backend
      await handleSignup(user);
    } else {
      alert('Passwords do not match!');
    }
  };

  const handleSignup = async (user) => {
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (data.message === 'User signed up successfully!') {
        setSignedUp(true); // Set to true to redirect or show success
      } else {
        setErrorMessage(data.message); // Show error message if any
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage('An error occurred during sign-up!');
    }
  };

  return signedUp ? (
    <CarStats /> // Redirect to the car stats page after successful signup
  ) : (
    <div className="signup-container">
      <h2>Signup for TheRev</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={user.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          value={user.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
        />
        <input
          type="text"
          name="location"
          value={user.location}
          onChange={handleChange}
          placeholder="Location (optional)"
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/signin">Sign In</a></p>
    </div>
  );
}

export default Signup;
