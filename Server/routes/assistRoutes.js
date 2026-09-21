const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const multer = require('multer')

// In-memory storage for listings (we'll use MongoDB)
const mongoose = require('mongoose')

// Listing Schema
const listingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  type: { type: String, enum: ['sell', 'lease', 'mechanic', 'swap'] },
  title: String,
  description: String,
  price: Number,
  priceUnit: { type: String, default: 'total' },
  images: [String],
  location: { latitude: Number, longitude: Number, address: String },
  contact: String,
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

const Listing = mongoose.model('Listing', listingSchema)

// GET all marketplace listings
router.get('/marketplace', async (req, res) => {
  try {
    const listings = await Listing.find({ 
      type: { $in: ['sell', 'lease'] },
      available: true 
    }).sort({ createdAt: -1 })
    res.json(listings)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET mechanics
router.get('/mechanics', async (req, res) => {
  try {
    const mechanics = await Listing.find({ 
      type: 'mechanic',
      available: true 
    }).sort({ createdAt: -1 })
    res.json(mechanics)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET bike swaps
router.get('/swaps', async (req, res) => {
  try {
    const swaps = await Listing.find({ 
      type: 'swap',
      available: true 
    }).sort({ createdAt: -1 })
    res.json(swaps)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST create listing
router.post('/create', protect, async (req, res) => {
  try {
    const { type, title, description, price, priceUnit, images, location, contact } = req.body
    
    const listing = await Listing.create({
      userId: req.user.id,
      userName: req.body.userName,
      type,
      title,
      description,
      price,
      priceUnit,
      images: images || [],
      location,
      contact
    })
    
    res.status(201).json({ message: 'Listing created!', listing })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// DELETE listing
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Not found' })
    if (listing.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }
    await listing.deleteOne()
    res.json({ message: 'Listing deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router