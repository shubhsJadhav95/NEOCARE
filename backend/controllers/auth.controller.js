const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Notification = require('../models/notification.model'); // Added for reward alerts

// --- EMAIL ENGINE (Strictly Using .env Credentials) ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  try {
    const userData = { ...req.body };
    
    if (req.files) {
      if (req.files.profile_photo) userData.profile_photo = req.files.profile_photo[0].path;
      if (req.files.degree_photo) userData.degree_photo = req.files.degree_photo[0].path;
      if (req.files.shop_photo) userData.shop_photo = req.files.shop_photo[0].path;
      if (req.files.license_photo) userData.license_photo = req.files.license_photo[0].path;
    }

    userData.emergency_contact_name = userData.emergency_contact_name || null;
    userData.emergency_contact_email = userData.emergency_contact_email || null;

    const existing = await User.findOne({ where: { email: userData.email } });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create(userData);

    // Logic: Send Initial Emergency Setup Confirmation
    if (user.emergency_contact_email) {
      const mailOptions = {
        from: `"NeoCare Protection" <${process.env.EMAIL_USER}>`,
        to: user.emergency_contact_email,
        subject: "EMERGENCY CONTACT ACTIVATED - NeoCare",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb;">Emergency Link Established</h2>
            <p>Hello <b>${user.emergency_contact_name}</b>,</p>
            <p>You have been set as the Emergency Contact for <b>${user.name}</b> on NeoCare.</p>
            <p>You will be notified immediately via this email if they trigger an SOS signal.</p>
          </div>
        `
      };
      transporter.sendMail(mailOptions).catch(err => console.error("Email Error:", err));
    }
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { id: user.id, name: user.name, role: user.role, status: user.status } 
    });
  } catch (err) {
    console.error("DEBUG - Registration Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        status: user.status, 
        profile_photo: user.profile_photo,
        registration_number: user.registration_number, 
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_email: user.emergency_contact_email,
        lat: user.lat,
        lon: user.lon,
        billingType: user.billingType,
        credits: user.credits,
        workoutStreak: user.workoutStreak, // Strictly added for fitness
        totalCaloriesBurned: user.totalCaloriesBurned // Strictly added for fitness
      } 
    });
  } catch (err) {
    console.error("DEBUG - Login Error:", err);
    res.status(500).json({ message: "Login Failure: Check DB schema" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("DEBUG - getMe Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { 
      contact_number, blood_group, address, 
      emergency_contact_name, emergency_contact_email,
      lat, lon, billingType, isSosTriggered 
    } = req.body;
    
    // --- STIRCT SOS EMAIL LOGIC ---
    if (isSosTriggered && user.emergency_contact_email) {
      const liveLat = lat || user.lat;
      const liveLon = lon || user.lon;
      const googleMapsLink = `https://www.google.com/maps?q=${liveLat},${liveLon}`;
      
      const mailOptions = {
        from: `"NeoCare EMERGENCY SOS" <${process.env.EMAIL_USER}>`,
        to: user.emergency_contact_email,
        subject: `🚨 URGENT: SOS Signal from ${user.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 30px; border: 5px solid #ef4444; border-radius: 20px; background-color: #fffafb;">
            <h1 style="color: #ef4444; text-transform: uppercase; margin-bottom: 5px;">Critical Emergency Alert</h1>
            <p style="font-size: 18px; color: #1e293b;"><b>${user.name}</b> has triggered an <b>Sos Signal</b> on the NeoCare Platform.</p>
            <div style="background: #ffffff; padding: 20px; border-radius: 15px; border: 1px solid #fecaca; margin: 20px 0;">
              <p style="margin: 5px 0;"><b>Patient Name:</b> ${user.name}</p>
              <p style="margin: 5px 0;"><b>Patient Contact:</b> ${contact_number || user.contact_number || 'Not Available'}</p>
              <p style="margin: 15px 0;"><b>Current Blood Group:</b> ${blood_group || user.blood_group || 'N/A'}</p>
              <a href="${googleMapsLink}" style="display: inline-block; background-color: #ef4444; color: white; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; margin-top: 10px;">📍 VIEW LIVE LOCATION ON MAP</a>
            </div>
            <p style="color: #64748b; font-size: 12px; font-style: italic;">Automated priority alert from NeoCare Health Systems.</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    }

    await user.update({
      contact_number, blood_group, address, emergency_contact_name, emergency_contact_email,
      lat: lat !== undefined ? lat : user.lat,
      lon: lon !== undefined ? lon : user.lon,
      billingType: billingType !== undefined ? billingType : user.billingType
    });

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("DEBUG - updateProfile Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor', status: 'approved' },
      attributes: ['id', 'name', 'specialist', 'profile_photo', 'years_of_experience', 'college_name', 'registration_number', 'lat', 'lon', 'billingType']
    });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- STIRCTLY ADDED: WORKOUT STREAK & REWARD POINTS LOGIC ---
exports.completeWorkout = async (req, res) => {
  try {
    const { userId, calories } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const lastWorkout = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;
    
    // 1. Calculate Streak Logic (Difference in days)
    let newStreak = user.workoutStreak || 0;
    if (lastWorkout) {
      const diffTime = Math.abs(now - lastWorkout);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1; // Consecutive day
      } else if (diffDays > 1) {
        newStreak = 1; // Streak broken
      }
    } else {
      newStreak = 1; // First ever workout
    }

    // 2. Reward Logic (Check for 5-day cycle)
    let bonusMessage = "";
    let updatedCredits = user.credits || 0;
    if (newStreak > 0 && newStreak % 5 === 0) {
      updatedCredits += 50;
      bonusMessage = " 🎉 5-Day Streak! 50 Credits Awarded!";
      
      await Notification.create({
        userId: user.id,
        title: "Fitness Milestone",
        message: "Amazing! You completed a 5-day streak and earned 50 credits.",
        type: "appointment"
      });
    }

    // 3. Save updates
    await user.update({
      workoutStreak: newStreak,
      credits: updatedCredits,
      lastWorkoutDate: now,
      completedWorkouts: (user.completedWorkouts || 0) + 1,
      totalCaloriesBurned: (user.totalCaloriesBurned || 0) + parseInt(calories)
    });

    res.json({ 
      message: "Workout Session Logged!" + bonusMessage, 
      streak: newStreak, 
      credits: updatedCredits 
    });
  } catch (err) {
    console.error("Workout Log Error:", err);
    res.status(500).json({ message: "Internal Error Logging Workout" });
  }
};