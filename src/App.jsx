import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';
import axios from 'axios';
import RentalDetails from './components/RentalDetails';
import BookingForm from './components/BookingForm';
import EditForm from './components/EditForm';

const localizer = momentLocalizer(moment);

if (process.env.NODE_ENV === 'production') {
    axios.defaults.baseURL = 'https://stock-backend-woad.vercel.app';
  } else {
    axios.defaults.baseURL = 'http://localhost:5000';
  }

function App() {
    const [events, setEvents] = useState([]);
    const [selectedRental, setSelectedRental] = useState(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [availableStock, setAvailableStock] = useState(5); 
    const [summary, setSummary] = useState([]);

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = () => {
        axios.get('/api/rentals')
            .then(response => {
                const rentals = response.data.map(rental => ({
                    title: `${rental.numberOfCameras} Kits - ${rental.renter.companyName}`,
                    start: new Date(rental.startDate),
                    end: new Date(rental.endDate),
                    ...rental
                }));
                setEvents(rentals);
                calculateStock(rentals);
            })
            .catch(error => console.error('Error fetching rental data:', error));
    };

    const calculateStock = (rentals) => {
        const rentedCameras = rentals.reduce((acc, rental) => {
            const today = new Date();
            if (new Date(rental.startDate) <= today && new Date(rental.endDate) >= today) {
                return acc + rental.numberOfCameras;
            }
            return acc;
        }, 0);
        setAvailableStock(5 - rentedCameras); // Assuming 10 cameras in total
    };

    const handleSelectEvent = (event) => {
        setSelectedRental(event);
        setShowEditForm(false);
    };

    const handleBookingComplete = () => {
        setShowBookingForm(false);
        fetchRentals();
    };

    const handleEditComplete = (updatedRental) => {
        setSelectedRental(updatedRental);
        setShowEditForm(false);
        fetchRentals();
    };

    const handleDelete = (rentalId) => {
        setSelectedRental(null);
        setShowEditForm(false);
        fetchRentals();
    };

    const openEditForm = () => {
        setShowEditForm(true);
    };

    const summarizeCameras = () => {
      const today = new Date();
      const summaryData = events
          .filter(rental => new Date(rental.start) <= today && new Date(rental.end) >= today)
          .map(rental => ({
              cameras: rental.numberOfCameras,
              companyName: rental.renter.companyName,
              location: rental.renter.location,
              endDate: rental.endDate,
          }));
      setSummary(summaryData);
  };
  

    return (
        <div className="App">
            <h1>FLIR A700 Camera Rentals</h1>
            <button onClick={() => setShowBookingForm(true)}>Book a Rental</button>
            <div className="stock-info">
                <p>Current Available Stock: {availableStock}</p>
                <button onClick={summarizeCameras}>Where are my cameras?</button>
            </div>
            {summary.length > 0 && (
                <div className="summary">
                    <h2>Camera Summary</h2>
                    {summary.map((item, index) => (
                        <p key={index}>
                            {item.cameras} cameras are with {item.companyName} in {item.location}, coming back on {new Date(item.endDate).toLocaleDateString()}
                        </p>
                    ))}
                </div>
            )}
            {showBookingForm && <BookingForm onBookingComplete={handleBookingComplete} />}
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectEvent={handleSelectEvent}
            />
            {selectedRental && !showEditForm && (
                <div className="rental-details">
                    <RentalDetails rental={selectedRental} />
                    <button onClick={openEditForm}>Edit Rental</button>
                </div>
            )}
            {showEditForm && (
                <EditForm
                    rental={selectedRental}
                    onEditComplete={handleEditComplete}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}

export default App;
