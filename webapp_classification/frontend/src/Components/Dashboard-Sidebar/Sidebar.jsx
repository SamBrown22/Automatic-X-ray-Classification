import React from 'react';
import './Sidebar.css'; // Import the CSS file for styling
import { NavLink } from 'react-router-dom';

const Sidebar = ({onLogout}) => {
  return (
    <div className="sidebar">
      <div className="Heading">
        <h2>My Dashboard</h2>
      </div>
      <nav className="nav-links">
        <NavLink to='/MyAccount' className='nav-link'>My Account</NavLink>
        <NavLink to='/PneumoniaModel' className='nav-link'>Pneumonia Classification</NavLink>
        <NavLink to='/FractureModel' className='nav-link'>Fracture Detection</NavLink>
        <NavLink to='/viewHistory' className='nav-link'>Classification History</NavLink>
        <NavLink to='/Upgrade' className='nav-link'>Upgrade</NavLink>
      </nav>
      <NavLink to='/Home' className='logout-nav' onClick={onLogout}> 
        <img src="/images/power-off.png" className='logout-img' style={{width: "25px", height: "25px", borderRadius: "50%"}} 
        alt="SignOut"/>
        Sign Out
      </NavLink>
    </div>
  );
}

export default Sidebar;
