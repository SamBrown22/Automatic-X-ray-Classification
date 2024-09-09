import React, { useState } from 'react';
import './Login.css'; // Import CSS file for styling
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const password = data.get('password');

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        // Login successful
        const userData = await response.json();
        console.log('Login successful:', userData.message);
        sessionStorage.setItem("token", userData.token, { sameSite: 'strict' });
        onLogin();
        navigate("/Home");
        
      } else {
        // Login failed
        const errorData = await response.json();
        console.error('Login failed:', errorData.error);
        setErrorMessage(errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    // Reset input fields
    setUsername('');
    setPassword('');
  };

  return (
    <div className="signInContainer">
      <div className="signInContent">
        <div className="avatarContainer">
          <img src="/images/padlock.png" alt="Lock Icon" className="avatar" />
        </div>
        <h1 className="signInHeading">Sign in</h1>
        <form onSubmit={handleSubmit} noValidate className="signInForm">
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
          <label className="rememberLabel">
            <input type="checkbox" value="remember" className="rememberCheckbox"/>
            Remember me
          </label>
          <button
            type="submit"
            className="signInButton"
          >
            Sign In
          </button>
        </form>
        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
        <div className="loginLinksContainer">
          <a href="/Home" className="forgotPasswordLink">Forgot password?</a>
          <a href="/SignUp" className="signUpLink">Dont have an account?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
