import './Account.css';
import Sidebar from '../../../Dashboard-Sidebar/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onLogout, userData }) => {
    const navigate = useNavigate();

    const handleNavigation = (location) => {
        navigate(location);
    }

    return (
        <>
        <Sidebar onLogout={onLogout}/>
        <div className="profile-container">
            <h1>Welcome {userData.username}!</h1>
            {userData.starting_subscription && (
                <>
                    <p>
                        You joined on: {new Date(userData.starting_subscription.start_date).toLocaleDateString('en-GB')}<br/>
                        Your Credit Amount: {userData.credits}
                    </p>
                    <button className="credit-link-btn" onClick={() => handleNavigation('/Upgrade')}> Get Credits</button>
                </>
            )}

            <div className="user-subscription-section">
                <h2>Current Subscription</h2>
                {userData.current_subscription && (
                    <>  

                        {userData.current_subscription.type && userData.current_subscription.end_date && userData.current_subscription.start_date && (
                            <p>
                                Became a {userData.current_subscription.type} on {new Date(userData.current_subscription.start_date).toLocaleDateString('en-GB')}
                                <br/>
                                Subscription Expiry Date: {new Date(userData.current_subscription.end_date).toLocaleDateString('en-GB')}
                            </p>
                        )}

                    </>
                )}
            
                {userData.current_subscription && userData.current_subscription.type === 'Guest' && (
                    <div className="user-subscription-card">
                        <h4>Starter Plan</h4>
                        <p>
                            Free<br/>
                            - Access to Pneumonia Classifier<br/>
                            - Limited Uses
                        </p>
                        <button disabled={true}>Current Plan</button>
                    </div>
                )}

                {userData.current_subscription && userData.current_subscription.type === 'Member' && (
                    <div className="user-subscription-card">
                        <h4>Pro Plan</h4>
                        <p>£20/month</p>
                        <button disabled={true}>Current Plan</button>
                    </div>
                )}

                {userData.current_subscription && userData.current_subscription.type === 'Enterprise' && (
                    <div className="user-subscription-card">
                        <h4>Enterprise Plan</h4>
                        <p>$30/month</p>
                        <button disabled={true}>Current Plan</button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default Profile;
