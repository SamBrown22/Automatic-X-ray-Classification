import React, { useEffect, useState } from 'react';
import './App.css';
import Taskbar from './Components/Taskbar/Taskbar';
import ContentContainer from './Components/Content-Container/ContentContainer';
import { BrowserRouter as Router } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from "@mui/x-date-pickers";

function App() {
  const [userData, setUserData] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = sessionStorage.getItem('token');
    return !!token; // Convert token presence to boolean
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
}, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  //Function to send a request for user data from server using token
  const fetchData = async () => {
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch('/getuser', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        });
        if (response.ok) {
            const userData = await response.json();
            setUserData(userData.user);
            console.log('Updated user data')
        } else {
            const errorData = await response.json();
            console.error('Login failed:', errorData.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Router>
      <>
        <Taskbar isLoggedIn={isLoggedIn} onLogout={handleLogout} userData={isLoggedIn ? userData : null} />
        <ContentContainer onLogin={handleLogin} onLogout={handleLogout} isLoggedIn={isLoggedIn} userData={userData} setUserData={setUserData}/>
      </>
    </Router>
    </LocalizationProvider>
  );
}

export default App;
