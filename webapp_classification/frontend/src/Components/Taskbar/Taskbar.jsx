import { NavLink } from 'react-router-dom';
import './Taskbar.css';

const Taskbar = ({ isLoggedIn, userData }) => {
  return (
    <div className="taskbar">
      <NavLink to="/Home" className="taskbar-item">Home</NavLink>

      <NavLink to="/classificationModel" className="taskbar-item" >Classification Demo</NavLink>

      <NavLink to="/About" className="taskbar-item" >How it works</NavLink>

      {!isLoggedIn && <NavLink to="/Login" className="taskbar-item" >Sign in</NavLink>}

      {isLoggedIn && (
        <NavLink to="/MyAccount" className="taskbar-item" id='account'>
          <img src="/images/profile.png" className="profile-img" alt="Profile"/>
        </NavLink>
      )}

      {isLoggedIn && (
        <NavLink to="/Upgrade" className="taskbar-item" id='credits'>
          <span>&#5548; {userData.credits}</span>
        </NavLink>
      )}

    </div>
  );
};

export default Taskbar;
