// ClassificationModel.jsx
import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import './ClassificationDemo.css';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const ClassificationModel = () => {
  // State variables for managing the model, predictions, selected image, loading state, and image reference
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef(null);

  // Function to load the pre-trained TensorFlow.js model
  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadLayersModel('/models/Pneumonia-JSModel/model.json');
      setModel(loadedModel);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading the model:', error);
    }
  };

  // Function to preprocess the uploaded image before prediction
  const preprocessImage = (img) => {
    const processedImage = tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat();
    const normalizedImage = processedImage.div(tf.scalar(255)).expandDims();
    return normalizedImage;
  };

  // Function to predict the uploaded image using the loaded model
  const predictImage = async (processedImage) => {
    if (model) {
      try {
        setLoading(true);
        setPredictions([]); // Clear predictions when a new prediction is declared

        // Simulate a delay of 1 second (adjust as needed)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const predictions = model.predict(processedImage);
        const predictionsArray = await predictions.data();

        console.log('Predictions:', predictionsArray);

        setPredictions(predictionsArray);
        processedImage.dispose();
        predictions.dispose();

        // Update last prediction timestamp in local storage
        localStorage.setItem('lastPredictionTimestamp', Date.now());
      } catch (error) {
        console.error('Error predicting image:', error);
      } finally {
        setLoading(false);
      }
    } else {
      console.warn('Model is not loaded yet.');
    }
  };

  // Function to check if a prediction can be made based on the number of predictions made today
  const canMakePrediction = () => {
    const currentDate = new Date();
    const currentDateString = currentDate.toDateString();
    const storedDateString = localStorage.getItem('predictionDate');

    if (storedDateString !== currentDateString) {
      // Reset prediction count for a new day
      localStorage.setItem('predictionCount', '0');
      localStorage.setItem('predictionDate', currentDateString);
    }

    const predictionCount = parseInt(localStorage.getItem('predictionCount')) || 0;
    const maxPredictionsPerDay = 3;

    return predictionCount < maxPredictionsPerDay;
  };


  // Event handler for uploading a new image
  const handleImageUpload = () => {
    const inputImage = imageRef.current;

    if (inputImage.files && inputImage.files[0]) {
      setPredictions([]); // Clear predictions when a new image is uploaded

      const file = inputImage.files[0];
      setSelectedFileName(file.name); //Set the file name

      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          setSelectedImage(img.src);
        };
      };

      reader.readAsDataURL(inputImage.files[0]);
    }
  };

  // Event handler for initiating the prediction
  const handlePredictionButtonClick = async () => {
    const inputImage = imageRef.current;
    if (inputImage.files && inputImage.files[0] && canMakePrediction()) {
      // Increment prediction count
      const predictionCount = (parseInt(localStorage.getItem('predictionCount')) || 0) + 1;
      localStorage.setItem('predictionCount', predictionCount.toString());

      // Your prediction logic here...
      const img = new Image();
      img.src = window.URL.createObjectURL(inputImage.files[0]);

      img.onload = async () => {
        const processedImage = preprocessImage(img);
        await predictImage(processedImage);
      };
    } else {
      toast.warn(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}} >
        <span>Daily Prediction Limit Reached!</span> 
        <Link to='/MyAccount' className='buttonLink'>Go to Model</Link>
      </div>,
      {
        position: 'top-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark"
      });
    }
  };

  //Remove Image from Selected Image
  const removeImage = () => {
    setSelectedFileName(null);
    setSelectedImage(null);
  };

  // Effect hook to load the model on component mount as asynchronous issue when trying to load on predict
  useEffect(() => {
    loadModel();
  
    return () => {
      if (model) {
        model.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  // JSX for rendering the component
  return (
    <div className="classification">

      {/* Div to hold title and image */}
      <div className='heading-container'>
        <p className="heading">Pneumonia Classification <br/> Demo</p>
        <img className='xray' src='/images/Chest_X-ray.jpeg' alt='X-ray'/>
      </div>

      <p className='model-description'>  This advanced model utlizes a Convolutional Neural Network (CNN) to 
      precisely analyse X-ray images, ensuring accurate pneumonia predicitons. Its advanced capabilities could
      provide valuable assistance to healthcare proffesionals in making diagnostic predictions. By combining artificial intelligience
      with medical expertise, this tool aims to improve pneumonia diagnosis,
      enhancing patient care and medical decisions. <Link to={'/About'} style={{color: '#6a0386'}}>Learn More</Link>
      </p>
      
      <p className='test-title'>Try it Yourself</p>

      {/* Input container for selecting an image file */}
      <div className="input-container">
        <label htmlFor="file-input" id="file-input-label">Choose an image</label>
        <input id="file-input" type="file" accept="image/*" ref={imageRef} onChange={handleImageUpload} />

        {/* Predict button */}
        {selectedImage && (
        <button className='predict-btn' onClick={handlePredictionButtonClick} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      )}

      </div>

      {/* Display the selected image and file name if available */}
      {selectedImage && (
        <div className="interact-container">
          <div className='image-selected-container'>
            <img className="selected-image" src={selectedImage} alt="Selected" />
            
            {selectedFileName && (
              <div className='file-info'>
                <p className="file-name">{`File: ${selectedFileName}`}</p>
                <button className='remove-button' onClick={removeImage}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                </button>
              </div>
            )}
          </div>
          <div className='prediction-container'>
            {/* Display loading indicator if predictions are in progress */}
            {loading && <p className="loading-indicator">Waiting for predictions...</p>}

            {/* Display predictions if available */}
            {predictions.length > 0 && (
              <div>
                <p className='prediction-title'>The Model predicts: </p>
                <p className='prediction-content'>{`Probability that the Image contains Pneumonia: ${(predictions[0] * 100).toFixed(2)}%`}</p>
                <p className='prediction-content'>{`Model Prediction: ${predictions[0] > 0.5 ? 'Pneumonia Detected !' : 'Normal'}`}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer style={{width: '420px'}}/>
    </div>
  );
};

export default ClassificationModel;
