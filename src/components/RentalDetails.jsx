import React from 'react';

function RentalDetails({ rental }) {
    return (
        <div>
            <h2>Rental Details</h2>
            <p><strong>Company:</strong> {rental.renter.companyName}</p>
            <p><strong>Location:</strong> {rental.renter.location}</p>
            <p><strong>Contact Person:</strong> {rental.renter.contactPerson}</p>
            <p><strong>Number of Cameras:</strong> {rental.numberOfCameras}</p>
            <p><strong>Lenses:</strong> {rental.lenses.join(', ')}</p>
            <p><strong>Status:</strong> {rental.status}</p>
            <p><strong>Start Date:</strong> {new Date(rental.startDate).toLocaleDateString()}</p>
            {rental.status === 'collected' && <p><strong>Start Time:</strong> {rental.startTime}</p>}
            <p><strong>End Date:</strong> {new Date(rental.endDate).toLocaleDateString()}</p>
            {rental.status === 'collected' && <p><strong>End Time:</strong> {rental.endTime}</p>}
        </div>
    );
}

export default RentalDetails;
