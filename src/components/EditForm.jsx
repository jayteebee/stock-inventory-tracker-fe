import React, { useState, useEffect } from 'react';
import axios from 'axios';

const lensOptions = ['6°', '14°', '24°', '42°', '80°'];

function EditForm({ rental, onEditComplete, onDelete }) {
    const [formData, setFormData] = useState({
        ...rental,
        lenses: rental.lenses || [],
        renter: { ...rental.renter },
    });

    useEffect(() => {
        setFormData({
            ...rental,
            lenses: rental.lenses || [],
            renter: { ...rental.renter },
        });
    }, [rental]);

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
    

    const handleSubmit = (e) => {
        e.preventDefault();
        const { startDate, startTime, endDate, endTime } = formData;
        const startDateTime = `${startDate}T${startTime}`;
        const endDateTime = `${endDate}T${endTime}`;
        const newFormData = { ...formData, startDateTime, endDateTime };
        axios.put(`http://localhost:5000/api/rentals/${rental._id}`, newFormData)
            .then(response => {
                onEditComplete(response.data);
                alert('Rental updated successfully');
            })
            .catch(error => console.error('Error updating rental:', error));
    };
    

    const handleDelete = () => {
        axios.delete(`http://localhost:5000/api/rentals/${rental._id}`)
            .then(() => {
                onDelete(rental._id);
                alert('Rental deleted successfully');
            })
            .catch(error => console.error('Error deleting rental:', error));
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
            <h2>Edit Rental</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Start Date:
                    <input type="date" name="startDate" value={formData.startDate.split('T')[0]} onChange={handleChange} required />
                </label>
                {formData.status === 'collection' && (
                    <label>
                        Start Time:
                        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                    </label>
                )}
                <br />
                <label>
                    End Date:
                    <input type="date" name="endDate" value={formData.endDate.split('T')[0]} onChange={handleChange} required />
                </label>
                {formData.status === 'collection' && (
                    <label>
                        End Time:
                        <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                    </label>
                )}
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
                <button type="submit">Save Changes</button>
                <button type="button" onClick={handleDelete} className="danger" style={{ backgroundColor: 'red', marginLeft: '10px' }}>Delete Rental</button>
            </form>
        </div>
    );
}

export default EditForm;
