import React, { useState, useEffect } from 'react';
import Sidebar from "../../../Dashboard-Sidebar/Sidebar";
import { DatePicker } from "@mui/x-date-pickers";
import './History.css';
import dayjs from 'dayjs'; // Import Day.js library

const History = ({onLogout}) => {
    const [imageUrls, setImageUrls] = useState([]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp/1); // Assuming timestamp is in milliseconds
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false, // Use 24-hour format
            timeZone: 'UTC' // UK timezone
        };
        const formattedDate = date.toLocaleString('en-GB', options)                                      
        .split('/')
        .reverse()
        .join('-');
        console.log(formattedDate);
        return formattedDate;
    };

    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

    useEffect(() => {
        console.log(selectedDate)
        const fetchHistory = async () => {
            try {
                const response = await fetch("/getHistory", {
                    method: "GET",
                    headers: {
                        'Authorization': sessionStorage.getItem('token')
                    },
                });
                
                const data = await response.json();
                const images = data.images.map(image => ({
                    url: image,
                    prediction: image.split('-')[3].split(".")[0],
                    timestamp: image.split('/')[6].split("-")[0]
                }));
                setImageUrls(images.reverse());
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };

        fetchHistory();
    }, []);

    const handleDateChange = (date) => {
        const formattedDate = date.format('YYYY-MM-DD');
        setSelectedDate(formattedDate);       
    };

    return (
        <>
        <Sidebar onLogout={onLogout}/>
        <div className="history-container">
            <div className="date-picker-section">
                <DatePicker 
                label='Select Date' 
                className='datepicker' 
                onChange={(date) => handleDateChange(date)} 
                disableFuture 
                defaultValue={dayjs()}
                slotProps={{
                    actionBar: {
                        actions: ['today'],
                    },
                    openPickerButton: {
                        color: 'secondary'
                    },
                    textField: {
                        color: 'secondary'
                    },
                                 
                }}
                
                />
            </div>
            <div className="history-image-container">
                {imageUrls.map((imageUrls, index) => (
                    formatDate(imageUrls.timestamp) === selectedDate && (
                        <div className='image-container'>
                            <img className="image" key={index} src={imageUrls.url} alt={`Image ${index}`} />
                            <p className="image-text">
                                {new Date(imageUrls.timestamp/1).toLocaleDateString('en-GB', {  
                                    timeZone: 'UTC', // Adjust the time zone if necessary
                                    weekday: 'long', // Display the full name of the day of the week
                                    year: 'numeric', // Display the full numeric year
                                    month: 'long', // Display the full name of the month
                                    day: 'numeric', // Display the day of the month
                                    hour: '2-digit', // Display hours in 24-hour format
                                    minute: '2-digit', // Display minutes
                                    second: '2-digit', // Display seconds
                                })}
                                <br/>
                                Predicted: {imageUrls.prediction}
                            </p>
                        </div>
                    )
                ))}
            </div>
        </div>
        </>
    );
};

export default History;
