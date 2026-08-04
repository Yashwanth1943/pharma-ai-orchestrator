require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

//  ❌ For DNS 
// const dns = require('dns');
// dns.setServers(['8.8.8.8', '8.8.4.4']);
// ❌ For MongoDB


// Connect to MongoDB
connectDB();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to req object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket connection logic
io.on('connection', (socket) => {
  console.log('Client connected to socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
const authRoutes = require('./src/routes/authRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const marketingRoutes = require('./src/routes/marketingRoutes');
const auditRoutes = require('./src/routes/auditRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/audit', auditRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

