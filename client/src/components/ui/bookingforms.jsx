// bookingforms.jsx
import React, { useState } from 'react';
import axios from 'axios';

function BookingForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sessionDate, setSessionDate] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const booking = {
      name,
      phone,
      email,
      sessionDate,
    };

    try {
      await axios.post('http://localhost:5000/api/bookings', booking);
      alert('Booking confirmed! A confirmation email has been sent.');
    } catch (error) {
      console.error('Error booking session', error);
      alert('Failed to book session.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Phone:
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Session Date:
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required />
        </label>
      </div>
      <button type="submit">Book Session</button>
    </form>
  );
}

export default BookingForm; // Make sure this line is present
