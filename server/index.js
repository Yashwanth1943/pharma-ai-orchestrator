require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

//  ❌ For DNS 
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
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

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to req object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Track online users: { userId: socketId }
const onlineUsers = new Map();

// Socket connection logic
io.on('connection', (socket) => {
  console.log('Client connected to socket:', socket.id);
  
  socket.on('setup', (userData) => {
    socket.join(`user_${userData._id}`);
    onlineUsers.set(userData._id, socket.id);
    // Broadcast to everyone that this user is online
    io.emit('user_status', { userId: userData._id, status: 'online' });
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

  socket.on('send_message', (data) => {
    // data is now a full populated Message object
    var chat = data.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach(user => {
      if (user._id == data.sender._id) return;
      io.to(`user_${user._id}`).emit('receive_message', data);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Find the user and emit offline status
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user_status', { userId, status: 'offline' });
        break;
      }
    }
  });
});

const authRoutes = require('./src/routes/authRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const marketingRoutes = require('./src/routes/marketingRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const consentRoutes = require('./src/routes/consentRoutes');
const outcomesRoutes = require('./src/routes/outcomesRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/outcomes', outcomesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/health', healthRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
