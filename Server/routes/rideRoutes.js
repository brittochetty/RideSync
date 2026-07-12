const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const { protect } = require('../middleware/authMiddleware');

// CREATE A RIDE
router.post('/create', protect, async (req, res) => {
  const { destination } = req.body;

  try {
    const rideCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const ride = await Ride.create({
      rideCode,
      createdBy: req.user.id,
      destination,
      riders: [{
        user: req.user.id,
        location: { latitude: 0, longitude: 0 }
      }]
    });

    res.status(201).json({
      message: 'Ride created successfully',
      rideCode: ride.rideCode,
      ride
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// JOIN A RIDE
router.post('/join', protect, async (req, res) => {
  const { rideCode } = req.body;

  try {
    const ride = await Ride.findOne({ rideCode });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const alreadyJoined = ride.riders.find(
      r => r.user.toString() === req.user.id
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already in this ride' });
    }

    ride.riders.push({
      user: req.user.id,
      location: { latitude: 0, longitude: 0 }
    });

    await ride.save();

    res.json({ message: 'Joined ride successfully', ride });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET RIDE DETAILS
router.get('/:rideCode', protect, async (req, res) => {
  try {
    const ride = await Ride.findOne({ rideCode: req.params.rideCode })
      .populate('riders.user', 'name email');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(ride);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;