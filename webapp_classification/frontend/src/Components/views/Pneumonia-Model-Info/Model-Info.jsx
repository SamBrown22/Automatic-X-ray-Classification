import React from 'react';
import './Model-Info.css';

const Model_Info = () => {
  return (
    <div className="Info-Container">
      <h2 className='Info-heading'>Pneumonia Classification using the RESNET-50 model</h2>

      <div className='section'>
        <p className='content' id="left">
          This Convolutional Neural Network (CNN) is designed to classify chest X-ray images
          and identify cases of pneumonia. The model leverages deep learning techniques,
          specifically convolutional layers, to automatically learn hierarchical features
          from the input images. <br/><br/>

          The model is trained on a <a class='dataset_link' href='https://www.kaggle.com/datasets/praveengovi/coronahack-chest-xraydataset/data'
          style={{color: '#6a0386'}}>
          labeled dataset of chest X-rays</a>, consisting of both normal and pneumonia cases. The model aims to accurately predict 
          whether an individual has pneumonia. This was achived through testing varying; initial learning rates, the learning rate depreciation 
          rate, different batch sizes. All these factors were optimised to try and prevent overfitting within the dataset. To analyse how these changes 
          affected the model the dataset was split (70/21/9) into training, validation and test sets respectively. 
          These sets were used for different parts of the model's training and evaluation phase.
        </p>

        <div className='graph-container'>
          <div className='graphs'>
            <img src='/images/Info_Loss.png' className='graph' alt="Graph"></img>
            <img src='/images/Info_Acc.png' className='graph' alt="Graph"></img>
          </div>
          <p className='caption'>figure1 - loss and accuracy graphs showing the current model performance during training aswell as the learning rate 
          for that epoch and initial lr
          </p>
        </div>
      </div>

      <div>
      <p className='content'>
        First of all the model uses the training set to update weights to improve its accuracy detecting related features
          within x-ray imaging. The validation set was also used during the training phase to evaluate the models performance at each epoch as seen above
          in figure 1.<br/><br/>
      </p>

      </div>
      <div className='section'>
        <div className='graph-container'>
          <img src='/images/PneumoniaModelMatrix.png' className='matrix' alt="ConfusionMatrix"></img>
        </div>
        <p className='content' id="right">
          Last of all the Test set was used to evaluate the final saved models performance and producing a confusion matrix this would analyse the models prediction 
          and the actual/true values of each image. The produced matrix for this model can be seen below.
        </p>
      </div>
    </div>
  );
};

export default Model_Info;