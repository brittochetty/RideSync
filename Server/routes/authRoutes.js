const crypto = require('crypto')
const nodemailer = require('nodemailer')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'No account with that email found' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex')

    // Save token and expiry to user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpire = Date.now() + 3600000 // 1 hour
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'RideSync — Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e63946;">🏍️ RideSync Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the button below:</p>
          <a href="${resetUrl}" style="
            background-color: #e63946;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            margin: 16px 0;
            font-weight: bold;
          ">Reset My Password</a>
          <p>This link expires in <strong>1 hour</strong>.</p>
          <p>If you didn't request this, ignore this email.</p>
          <hr/>
          <p style="color: #666; font-size: 12px;">RideSync — Ride Together. Stay Connected.</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    res.json({ message: 'Password reset email sent!' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.json({ message: 'Password reset successful! Please login.' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
module.exports = router;