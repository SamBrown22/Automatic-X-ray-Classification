import { Route, Routes, Navigate } from 'react-router-dom';
import ClassificationDemo from '../views/Pnemonia-Demo/ClassificationDemo.jsx';
import ModelInfo from '../views/Pneumonia-Model-Info/Model-Info.jsx';
import Homepage from '../views/Homepage/Homepage.jsx';
import Login from '../views/Login/Login.jsx';
import Signup from '../views/SignUp/SignUp.jsx';
import Account from '../views/Dashboard/Account/Account.jsx';
import PneumoniaModel from '../views/Dashboard/Pneumonia-Model/Pneumonia-Model.jsx';
import FractureModel from '../views/Dashboard/Fracture-Model/Fracture-Model.jsx';
import Upgrade from '../views/Dashboard/Upgrade/Upgrade.jsx';
import  History  from '../views/Dashboard/History/History.jsx';
import './ContentContainer.css';

const ContentContainer = ({ onLogin, onLogout, isLoggedIn, userData, setUserData }) => {
  return (
    <div className='content-container'>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/classificationModel' element={<ClassificationDemo />} />
        <Route path='/Home' element={<Homepage />} />
        <Route path='/About' element={<ModelInfo />} />
        <Route path='/Login' element={<Login onLogin={onLogin} />} />
        <Route path='/SignUp' element={<Signup />} />
        <Route path='/MyAccount' element={isLoggedIn ? <Account onLogout={onLogout} userData={userData}/> : <Navigate to="/Login" />} />
        <Route path='/PneumoniaModel' element={!isLoggedIn ? <Navigate to="/Login" /> //If not logged in show Login
          : userData.subscription && userData.subscription.type === 'Guest' ? <Navigate to="/MyAccount" /> //If they have guest membership return to Account
          : <PneumoniaModel onLogout={onLogout} userData={userData} setUserData={setUserData}/>}  //Otherwise show Intended outcome
        />
        <Route path='/FractureModel' element={!isLoggedIn ? <Navigate to="/Login" /> //If not logged in show Login
          : userData.subscription && userData.subscription.type === 'Guest' ? <Navigate to="/MyAccount" /> //If they have guest membership return to Account
          : <FractureModel onLogout={onLogout} userData={userData} setUserData={setUserData}/>}  //Otherwise show Intended outcome
        />
        <Route path='/viewHistory' element={!isLoggedIn ? <Navigate to="/Login" /> //If not logged in show Login
          : <History onLogout={onLogout} userData={userData} setUserData={setUserData}/>}  //Otherwise show Intended outcome
        />
        <Route path='/Upgrade' element={isLoggedIn ? <Upgrade onLogout={onLogout} userData={userData}/> : <Navigate to="/Login" />} />
      </Routes>
    </div>
  );
};

export default ContentContainer;
