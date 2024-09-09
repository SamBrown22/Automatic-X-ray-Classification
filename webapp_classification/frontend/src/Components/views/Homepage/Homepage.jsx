import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="page">
        <p className="title">
          AI in X-ray<br/> Classification
        </p>
        
        <p className='description'>
          USING AI TO ADVANCE HEALTHCARE
        </p>

        {/* Button to navigate to the classifier page */}
        <Link to="/classificationModel" className="classifier-button">
          Test for Pneumonia
        </Link>

    </div>
  );
};

export default Homepage;
