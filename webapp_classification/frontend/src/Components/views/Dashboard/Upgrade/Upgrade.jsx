import './Upgrade.css';
import Sidebar from '../../../Dashboard-Sidebar/Sidebar.jsx';
import { ToastContainer, toast } from 'react-toastify';

const Upgrade = ({ onLogout, userData }) => {

    const handleBuySubscription = async (subscriptionType) => {
        const token = sessionStorage.getItem('token');
        try{
            const response = await fetch("/updateSubscription", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify({ subscriptionType })
            
            })

            if (response.ok) {
                // Signup successful
                toast.success('Successfully Changed Subscription', {
                    autoClose:500,
                });
                window.location.reload();
    
              } else {
                // Signup failed
                toast.error('Error Changing Subscription', {
                    autoClose:500
                });
            }
            
        }
        catch(error){
            console.log("Error: ", error)
        }
    };

    const handleCreditPurchase = async (amount) => {
        const token = sessionStorage.getItem('token');
        try{
            const response = await fetch("/updateCredits", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify({ amount })
            
            })

            if (response.ok) {
                // Signup successful
                toast.success(`Successfully added ${amount} credits`, {
                    autoClose:500,
                });
                window.location.reload();
    
              } else {
                // Signup failed
                toast.error('Error Changing Subscription', {
                    autoClose:500
                });
            }
            
        }
        catch(error){
            console.log("Error: ", error)
        }
    }

    return (
        <>
        <Sidebar onLogout={onLogout}/>
        <div className="profile-container">
            <h1>Upgrade your account</h1>
            <p></p>
            {userData.current_subscription && (
            <div className="subscription-section">
                <h2>Subscription</h2>
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

                <h3>Choose your plan:</h3>
                <div className="subscription-cards">
                    {userData.current_subscription.type && (
                    <>
                    <div className="subscription-card">
                        <h4>Starter Plan</h4>
                        <p>
                            Free <br/><br/>
                            - Access to Classifier Demo <br/>
                            - Limited Uses
                        </p>
                        <button 
                            onClick={() => handleBuySubscription('Guest')} 
                            disabled={userData.current_subscription && userData.current_subscription.type === 'Guest'}
                        >
                            {userData.current_subscription && userData.current_subscription.type === 'Guest' ? 'Current Plan' : 'JOIN NOW'}
                        </button>
                    </div>

                    <div className="subscription-card">
                        <h4>Pro Plan</h4>
                        <p>
                            £10/month <br/><br/>
                            - &#5548;1,500 monthly <br/>
                            - Access to Pnemonia Classifier <br/>
                            - Access to Fracture Detector
                        </p>
                        <button 
                            onClick={() => handleBuySubscription('Member')} 
                            disabled={userData.current_subscription && userData.current_subscription.type === 'Member'}
                        >
                            {userData.current_subscription && userData.current_subscription.type === 'Member' ? 'Current Plan' : 'JOIN NOW'}
                        </button>
                    </div>

                    <div className="subscription-card">
                        <h4>Enterprise Plan</h4>
                        <p>
                            £50/month <br/><br/>
                            - &#5548;20,000 monthly <br/>
                            - Access to Pnemonia Classifier <br/>
                            - Access to Fracture Detector
                        </p>
                        <button 
                            onClick={() => handleBuySubscription('Enterprise')} 
                            disabled={userData.current_subscription && userData.current_subscription.type === 'Enterprise'}
                        >
                            {userData.current_subscription&& userData.current_subscription.type === 'Enterprise' ? 'Current Plan' : 'JOIN NOW'}
                        </button>
                    </div>
                    </>
                    )}
                </div>
            </div>
            )}
            
            {userData.current_subscription && userData.current_subscription.type !== 'Guest' ? (
            <>
            <h3>Get More Credits:</h3>
            <div className="credit-options">
                <div className="credit-option">
                    <h4>&#5548;600 credits</h4>
                    <p style={{backgroundImage: `url("/images/small-credits.png")`}}/>
                    <button onClick={() => handleCreditPurchase(600)}>£3.99 </button>
                </div>

                <div className="credit-option">
                    <h4>&#5548;2,500 credits</h4>
                    <p style={{backgroundImage: `url("/images/medium-credits.png")`}}/>
                    <button onClick={() => handleCreditPurchase(2500)}>£9.99 </button>
                </div>

                <div className="credit-option">
                    <h4>&#5548;7,500 credits</h4>
                    <p style={{backgroundImage: `url("/images/large-credits.png")`}}/>
                    <button onClick={() => handleCreditPurchase(7500)}>£24.99 </button>
                </div>
            </div>
            </>
            ) : (
            <h3>Please upgrade your subscription to get access to purchase additional credits</h3>
            )}
        </div>
            <ToastContainer/>
        </>
    );
};

export default Upgrade;
