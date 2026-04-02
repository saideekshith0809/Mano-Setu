
const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    if (require('mongoose').connection.readyState !== 1 || process.env.MOCK_DB === 'true') {
        console.log('⚠️ DB OFFLINE: Bypassing for hackathon demo.');
        return res.json({ success: true, message: 'Hackathon Mode: Success (Offline)', mock: true });
    }

    try {
        const { name, date, sessionType, preferredTime, urgency, notes, doctorId, doctorName } = req.body;
        const booking = new Booking({
            userId: req.user.id,
            userName: name || req.user.username,
            doctorId,
            doctorName,
            date,
            sessionType,
            preferredTime,
            urgency,
            notes
        });
        await booking.save();
        res.status(201).json({ success: true, message: 'Booking confirmed!', booking });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to create booking.' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch bookings.' });
    }
};
