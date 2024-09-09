import React, { useState } from 'react';
import './SignUp.css'; // Import CSS file for styling
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const password = data.get('password');
    const passwordMatch = data.get('password-confirm');

    if (passwordMatch === password) {
      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        if (response.ok) {
          // Signup successful
          const userData = await response.json();
          console.log('Signup successful:', userData.message);
          toast.success('Account created successfully!', {
            autoClose:1000,
            onClose: () => navigate('/Login')
          });
        } else {
          // Signup failed
          const errorData = await response.json();
          console.error('Signup failed:', errorData.error);
          setErrorMessage(errorData.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.log("Password doesn't match");
      setErrorMessage("Password doesn't match!");
    }

    // Reset input fields
    setUsername('');
    setPassword('');
    setPasswordConfirm('');
  }
  return (
    <div className="signUpContainer">
      <div className="signUpContent">
        <div className="avatarContainer">
          <img src="/images/padlock.png" alt="Lock Icon" className="avatar" />
        </div>
        <h1 className="signUpHeading">Sign Up</h1>
        <form onSubmit={handleSubmit} noValidate className="signUpForm">
          <input
            type="username"
            name="username"
            placeholder="Username"
            className="inputField"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="inputField"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            name="password-confirm"
            placeholder="Re-type Password"
            className="inputField"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
          <button
            type="submit"
            className="signUpButton"
          >
            Sign Up
          </button>
        </form>
        {errorMessage && <p className="errorMessage">Invalid: {errorMessage}</p>}
        <div className="linksContainer">
          <a href="/Login" className="signInLink">Already have an account?</a>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
