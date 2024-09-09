// ClassificationModel.jsx
import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import './Pneumonia-Model.css'; // Add styles in ClassificationModel.css
import Sidebar from '../../../Dashboard-Sidebar/Sidebar.jsx';
import { saveAs } from 'file-saver';
import { ToastContainer, toast } from 'react-toastify';

const PneumoniaModel = ({onLogout, userData, setUserData}) => {
  // State variables for managing the model, predictions, selected images, loading state, and image reference
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedFileNames, setSelectedFileNames] = useState([]);
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
    const normalisedImage = processedImage.div(tf.scalar(255)).expandDims();
    return normalisedImage;
  };

  const predictImage = async (processedImage) => {
    if (model) {
      try {
        const prediction = await model.predict(processedImage).data(); // Get prediction data
        return prediction;
      } 
      catch (error) {
        console.error('Error predicting image:', error);
      } 
    } 
    else {
      console.warn('Model is not loaded yet.');
    }
  };

  // Event handler for uploading images
  const handleImageUpload = () => {
    setPredictions([]);
    const inputImage = imageRef.current;

    if (inputImage.files && inputImage.files.length > 0) {
      const filesArray = Array.from(inputImage.files);
      const imageUrls = filesArray.map(file => URL.createObjectURL(file));
      setSelectedImages(prevImages => [...prevImages, ...imageUrls]); // Append new images
      const fileNames = filesArray.map(file => file.name);
      setSelectedFileNames(prevNames => [...prevNames, ...fileNames]); // Append new file names
    }
  };

  const handlePredictionButtonClick = async () => {
    setPredictions([]); // Clear predictions on button click
    setLoading(true);
    const allPredictions = [];

    // Check is they have enough creits if every prediction cost 10 credits
    if (selectedImages.length * 10 >  userData.credits){
      toast.error('Not Enough Credits', {
        autoClose:500
      });
      setLoading(false)
      return;
    }

    if (selectedImages.length > 0) {
      try {
        for (let i = 0; i < selectedImages.length; i++) {
          const img = new Image();
          img.src = selectedImages[i];
  
          await new Promise(resolve => {
            img.onload = async () => {
              const processedImage = preprocessImage(img);
              const prediction = await predictImage(processedImage);
              allPredictions.push(prediction);
              setPredictions(allPredictions);
              resolve();
            };
          });
        }

        // Update user's credit balance client-side
        setUserData(prevUserData => ({
          ...prevUserData,
          credits: prevUserData.credits - (selectedImages.length * 10)
        }));

        // Update user's credit balance on the server
        const amount = selectedImages.length * -10
        await fetch("/updateCredits", {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
              'Authorization': sessionStorage.getItem('token')
          },
          body: JSON.stringify({ amount })
        })

        const formData = new FormData();

        // Create an array of promises for fetching image data
        const promises = selectedImages.map(async (imageBlobUrl, index) => {
          try {
            const response = await fetch(imageBlobUrl);
            const blob = await response.blob();
            formData.append('image', blob, `${allPredictions[index] > 0.5 ? 'Pneumonia' : 'Normal'}.jpg`);
          } catch (error) {
            console.error('Error fetching image:', error);
          }
        });

        // Wait for all promises to resolve before making the fetch request
        await Promise.all(promises);

        // Now, make the fetch request
        await fetch("/uploadImages", {
          method: "POST",
          body: formData,
          headers: {
            'Authorization': sessionStorage.getItem('token')
          },
        });

      } catch (error) {
        console.error('An error occurred while predicting images:', error);
      }
    }
    setLoading(false);
  };

  // Remove Image from Selected Image
  const removeImage = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setSelectedFileNames((prevNames) => prevNames.filter((_, i) => i !== index));
    setPredictions([]);
  };

  const handleDownload = () => {
    if (predictions.length === selectedImages.length){
      const textContent = selectedFileNames
      .map((fileName, i) => `${fileName}: ${predictions[i] > 0.5 ? 'Pneumonia' : 'Normal'}`)
      .join('\n');

      // Create a Blob with the text content
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });

      // Ask for confirmation before downloading
      const confirmDownload = window.confirm('Do you want to download the predictions file?');
      if (confirmDownload) {
        // Save the Blob as a file
        saveAs(blob, 'predictions.txt');
      }
    }
  }

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

  return (
    <>
    <Sidebar onLogout={onLogout}/>
    <div className="pneumonia-model">

      {/* Div to hold title and image */}
      <div className='pneumonia-heading-container'>
        <p className="pneumonia-heading">Pneumonia Classification Model</p>
      </div>

      {/* Input container for selecting an image file */}
      <div className="pneumonia-input-container">
        {/* Choose Image button */}
        <label htmlFor="pneumonia-file-input" id="pneumonia-file-input-label">Choose an image</label>
        <input id="pneumonia-file-input" type="file" accept="image/*" ref={imageRef} onChange={handleImageUpload} multiple/>

        {/* Predict button */}
        {selectedImages.length > 0 && (
          <button className='pneumonia-predict-btn' onClick={handlePredictionButtonClick} disabled={loading}>
            {loading ? 'Predicting...' : 'Predict \u15AC' + (10 * selectedImages.length)}
          </button>
        )}
      </div>

      {/* Display the selected images and file names if available */}
      {selectedImages.length > 0 && (
        <div className="pneumonia-interact-container">
          {selectedImages.map((image, index) => (
            <div className='pneumonia-image-selected-container' key={index}>
              <img className="pneumonia-selected-image" src={image} alt={`Selected ${index}`} />
              {selectedFileNames[index] && (
                <div className='pneumonia-file-info'>
                  <p className="pneumonia-file-name">{`${selectedFileNames[index]}`}</p>
                  <button className='pneumonia-remove-button' onClick={() => removeImage(index)}>
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
            ))}
        </div>
      )}
      <div className='pneumonia-prediction-container'>
        {/* Display loading indicator if predictions are in progress */}
        {loading && <p className="pneumonia-loading-indicator">Waiting for predictions...</p>}
        
        {/* Display predictions if available */}
        {predictions.length === 1 && !loading && (
          <div>
            <p className='pneumonia-prediction-title'>The Model predicts: </p>
            <p className='pneumonia-prediction-content'>{`Probability that the Image contains Pneumonia: ${(predictions[predictions.length-1] * 100).toFixed(2)}%`}</p>
            <p className='pneumonia-prediction-content'>{`Model Prediction: ${predictions[predictions.length-1] > 0.5 ? 'Pneumonia Detected !' : 'Normal'}`}</p>
          </div>
        )}

        {/* Display download button if predictions are avaliable*/}
        {predictions.length > 1 && (
          <div>
            <button className='pneumonia-predict-btn' onClick={handleDownload}>
              Download
            </button>
          </div>
        )}

      </div>
      <ToastContainer/>
    </div>
    </>
  );
};

export default PneumoniaModel;
