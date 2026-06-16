const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const { Op } = require('sequelize');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
require('dotenv').config();
const db = require('./config/db.config');

// Models
const User = require('./models/user.model');
const Appointment = require('./models/appointment.model');
const Medicine = require('./models/medicine.model');
const Prescription = require('./models/prescription.model');
const Order = require('./models/order.model');
const Setting = require('./models/setting.model');
const Recommendation = require('./models/recommendation.model');
const Notification = require('./models/notification.model');
const Review = require('./models/review.model');
const Tracker = require('./models/tracker.model');
const Chat = require('./models/chat.model');
const CreditRequest = require('./models/creditRequest.model');

// Routes
const authRoutes = require('./routes/auth.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const medicineRoutes = require('./routes/medicine.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const orderRoutes = require('./routes/order.routes');
const statsRoutes = require('./routes/stats.routes');
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');
const notificationRoutes = require('./routes/notification.routes');
const reviewRoutes = require('./routes/review.routes');
const trackerRoutes = require('./routes/tracker.routes');
const chatRoutes = require('./routes/chat.routes');
const creditRoutes = require('./routes/credit.routes');

const app = express();
const server = http.createServer(app);

/* -------------------- ENV -------------------- */
const FRONTEND_URL = process.env.FRONTEND_URL || "https://neocare.devcloudzone.store";
const PORT = process.env.PORT || 5000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

// Node/Express example
app.use(cors({
  origin: ['https://neocare.devcloudzone.store'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* -------------------- SOCKET.IO -------------------- */
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const activeVideoUsers = {};

/* -------------------- HEALTH CHECK -------------------- */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/* -------------------- ASSOCIATIONS -------------------- */
Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

Medicine.belongsTo(User, { as: 'pharmacist', foreignKey: 'pharmacistId' });
User.hasMany(Medicine, { foreignKey: 'pharmacistId' });

Prescription.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
Prescription.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });

Order.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
Order.belongsTo(User, { as: 'pharmacist', foreignKey: 'pharmacistId' });
Order.belongsTo(Medicine, { as: 'medicine', foreignKey: 'medicineId' });

Recommendation.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Medicine.hasMany(Review, { as: 'reviews', foreignKey: 'medicineId' });
Review.belongsTo(Medicine, { foreignKey: 'medicineId' });
Review.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Tracker.belongsTo(User, { foreignKey: 'userId' });
CreditRequest.belongsTo(User, { foreignKey: 'userId' });

/* -------------------- ROUTES -------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/credits', creditRoutes);

/* -------------------- SOCKET LOGIC -------------------- */
io.on('connection', (socket) => {

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    activeVideoUsers[userId] = socket.id;
    console.log(`User ${userId} connected`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, message } = data;
      const savedMsg = await Chat.create({ senderId, receiverId, message });
      io.to(`user_${receiverId}`).emit('receive_message', savedMsg);
    } catch (err) {
      console.error("Socket error", err);
    }
  });

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    const targetSocket = activeVideoUsers[userToCall];
    if (targetSocket) {
      io.to(targetSocket).emit('incomingCall', {
        signal: signalData,
        from,
        name
      });
    }
  });

  socket.on('answerCall', (data) => {
    const targetSocket = activeVideoUsers[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit('callAccepted', data.signal);
    }
  });

  socket.on('endCall', ({ to }) => {
    const targetSocket = activeVideoUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit('callEnded');
    }
  });

  socket.on('disconnect', () => {
    for (const userId in activeVideoUsers) {
      if (activeVideoUsers[userId] === socket.id) {
        delete activeVideoUsers[userId];
        break;
      }
    }
    console.log("User disconnected");
  });
});

/* -------------------- CRON JOB -------------------- */
cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();

    const delayedRequests = await CreditRequest.findAll({
      where: {
        status: 'pending',
        expiresAt: { [Op.lt]: now }
      }
    });

    for (const req of delayedRequests) {
      const user = await User.findByPk(req.userId);

      if (user) {
        const penalty = 100;

        await user.increment('credits', { by: penalty });

        if (req.type === 'buy') {
          await user.increment('credits', { by: req.amount });
          await req.update({
            status: 'penalty_applied',
            penaltyAmount: penalty
          });
        } else {
          await req.update({
            penaltyAmount: (req.penaltyAmount || 0) + penalty
          });
        }
      }
    }
  } catch (err) {
    console.error("Penalty Error:", err);
  }
});

/* -------------------- MED CLEANUP -------------------- */
const cleanupExpiredMeds = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    await Medicine.update(
      { status: 'expired' },
      {
        where: {
          expiryDate: { [Op.lte]: today },
          status: { [Op.ne]: 'expired' }
        }
      }
    );
  } catch (err) {
    console.error("Cleanup Error:", err);
  }
};

/* -------------------- START SERVER -------------------- */
db.sync()
  .then(async () => {

    const defaultSettings = [
      { key: 'fee_doctor', value: '15' },
      { key: 'fee_pharmacist', value: '10' },
      { key: 'fee_patient', value: '5' }
    ];

    for (const s of defaultSettings) {
      await Setting.findOrCreate({
        where: { key: s.key },
        defaults: { value: s.value }
      });
    }

    await cleanupExpiredMeds();

    console.log("Database synced successfully");
    console.log(`Server running on port ${PORT}`);

    server.listen(PORT);
  })
  .catch(err => {
    console.error("Database Sync Failed", err);
  });