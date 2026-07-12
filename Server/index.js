const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');

const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A rider connected:', socket.id);

  socket.on('join-ride', (rideCode) => {
    socket.join(rideCode);
    console.log(`Rider joined ride room: ${rideCode}`);
  });

  socket.on('send-location', (data) => {
    socket.to(data.rideCode).emit('receive-location', data);
  });

  socket.on('send-reaction', (data) => {
    socket.to(data.rideCode).emit('receive-reaction', data)
  })

  socket.on('disconnect', () => {
    console.log('A rider disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('RideSync backend is running!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});