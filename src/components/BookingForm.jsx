import React, { useState } from 'react';
import axios from 'axios';

const lensOptions = ['6°', '14°', '24°', '42°', '80°'];

function BookingForm({ onBookingComplete }) {
    const [formData, setFormData] = useState({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        numberOfCameras: '',
        lenses: [],
        status: '',
        renter: {
            companyName: '',
            location: '',
            contactPerson: '',
        }
    });
    const [availableCameras, setAvailableCameras] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name in formData.renter) {
            setFormData({ ...formData, renter: { ...formData.renter, [name]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleLensChange = (e) => {
        const options = e.target.options;
        const selectedLenses = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                selectedLenses.push(options[i].value);
            }
        }
        setFormData({ ...formData, lenses: selectedLenses });
    };
    

    const checkAvailability = () => {
        const { startDate, endDate, numberOfCameras } = formData;
        axios.post('/api/rentals/availability', { startDate, endDate })
            .then(response => {
                const availableCameras = response.data.availableCameras;
                if (numberOfCameras > availableCameras) {
                    const upcomingReturns = response.data.upcomingReturns;
                    const message = upcomingReturns.length > 0 
                        ? `There isn't enough stock to create this booking. In ${upcomingReturns[0].daysUntilReturn} days, we'll be receiving ${upcomingReturns[0].numberOfCameras} cameras back from ${upcomingReturns[0].companyName} in ${upcomingReturns[0].location}.`
                        : `There isn't enough stock to create this booking.`;
                    alert(message);
                } else {
                    setAvailableCameras(availableCameras);
                }
            })
            .catch(error => console.error('Error checking availability:', error));
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();
        const { startDate, startTime, endDate, endTime, numberOfCameras } = formData;
        const startDateTime = `${startDate}T${startTime}`;
        const endDateTime = `${endDate}T${endTime}`;
        axios.post('/api/rentals/availability', { startDate, endDate })
            .then(response => {
                const availableCameras = response.data.availableCameras;
                if (numberOfCameras > availableCameras) {
                    const upcomingReturns = response.data.upcomingReturns;
                    const message = upcomingReturns.length > 0 
                        ? `There isn't enough stock to create this booking. In ${upcomingReturns[0].daysUntilReturn} days, we'll be receiving ${upcomingReturns[0].numberOfCameras} cameras back from ${upcomingReturns[0].companyName} in ${upcomingReturns[0].location}.`
                        : `There isn't enough stock to create this booking.`;
                    alert(message);
                } else {
                    const newFormData = { ...formData, startDateTime, endDateTime };
                    axios.post('/api/rentals', newFormData)
                        .then(response => {
                            onBookingComplete();
                            alert('Rental booked successfully');
                        })
                        .catch(error => console.error('Error booking rental:', error));
                }
            })
            .catch(error => console.error('Error checking availability:', error));
    };
    
    

    const handleAddLens = () => {
        const selectedLens = formData.selectedLens;
        if (selectedLens && !formData.lenses.includes(selectedLens)) {
            setFormData({ ...formData, lenses: [...formData.lenses, selectedLens], selectedLens: '' });
        }
    };
    
    const handleRemoveLens = (lens) => {
        setFormData({ ...formData, lenses: formData.lenses.filter(l => l !== lens) });
    };
    

    return (
        <div>
            <h2>Book a Rental</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Start Date:
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                </label>
                <label>
                    Start Time:
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    End Date:
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                </label>
                <label>
                    End Time:
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Number of Cameras:
                    <input type="number" name="numberOfCameras" value={formData.numberOfCameras} onChange={handleChange} required />
                </label>
                <br />
                <label>
                Lens:
                <select name="selectedLens" value={formData.selectedLens || ''} onChange={handleChange}>
                    <option value="" disabled>Select a lens</option>
                    {lensOptions.map((lens, index) => (
                        <option key={index} value={lens}>{lens}</option>
                    ))}
                </select>
                <button type="button" onClick={handleAddLens}>Add Lens</button>
            </label>
            <br />
            {formData.lenses.length > 0 && (
                <div>
                    <h4>Selected Lenses:</h4>
                    <ul>
                        {formData.lenses.map((lens, index) => (
                            <li key={index}>
                                {lens} <button type="button" onClick={() => handleRemoveLens(lens)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            
                <br />
                <label>
                    Status:
                    <select name="status" value={formData.status} onChange={handleChange} required>
                        <option value="posted">Posted to site</option>
                        <option value="collected">Collection from office</option>
                    </select>
                </label>
                <br />
                <h3>Renter Details</h3>
                <label>
                    Company Name:
                    <input type="text" name="companyName" value={formData.renter.companyName} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Location:
                    <input type="text" name="location" value={formData.renter.location} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Contact Person:
                    <input type="text" name="contactPerson" value={formData.renter.contactPerson} onChange={handleChange} required />
                </label>
                <br />
                <button type="button" onClick={checkAvailability}>Check Availability</button>
                {availableCameras !== null && <p>Available Cameras: {availableCameras}</p>}
                <br />
                <button type="submit">Book Rental</button>
            </form>
        </div>
    );
}

export default BookingForm;
