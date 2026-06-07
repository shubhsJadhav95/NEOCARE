const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Medicine = require('../models/medicine.model');
const Order = require('../models/order.model');
const Setting = require('../models/setting.model');
const { Op, fn, col } = require('sequelize');

exports.getPatientStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const appointments = await Appointment.count({ where: { patientId: userId } });
    const orders = await Order.count({ where: { patientId: userId } });
    const delivered = await Order.count({ where: { patientId: userId, status: 'delivered' } });
    res.json({ appointments, orders, delivered });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getDoctorStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const appointments = await Appointment.findAll({ where: { doctorId: userId } });
    const pending = await Appointment.count({ where: { doctorId: userId, status: 'pending' } });
    
    let earnings = 0;
    appointments.forEach(app => {
      if (app.billingType === 'fixed' && app.isFollowUp) earnings += 0;
      else earnings += 500;
    });

    res.json({ totalAppointments: appointments.length, pending, earnings });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPharmacistStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const totalMedicines = await Medicine.count({ where: { pharmacistId: userId } });
    const activeOrders = await Order.count({ where: { pharmacistId: userId, status: 'pending' } });
    const totalSales = await Order.sum('totalPrice', { where: { pharmacistId: userId, status: 'delivered' } }) || 0;
    res.json({ totalMedicines, activeOrders, totalSales });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPharmacistAnalytics = async (req, res) => {
  try {
    const { pharmacistId } = req.params;
    const { range } = req.query;
    let startDate = new Date();
    if (range === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else if (range === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate.setDate(startDate.getDate() - 7);

    const sales = await Order.findAll({
      where: { pharmacistId, status: 'delivered', createdAt: { [Op.gte]: startDate } },
      attributes: [[fn('DATE', col('createdAt')), 'date'], [fn('SUM', col('totalPrice')), 'revenue']],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });

    const inventory = await Medicine.findAll({
      where: { pharmacistId },
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category']
    });

    res.json({
      sales: sales.map(s => ({ day: s.dataValues.date, revenue: parseFloat(s.dataValues.revenue) })),
      categories: inventory.map(i => ({ name: i.category, value: parseInt(i.dataValues.count) }))
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPharmacistRevenue = async (req, res) => {
  try {
    const { pharmacistId } = req.params;
    const { range } = req.query;
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); 

    if (range === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
    else if (range === 'week') startDate.setDate(startDate.getDate() - 7);
    else startDate.setMonth(startDate.getMonth() - 1);

    const feeSetting = await Setting.findOne({ where: { key: 'fee_pharmacist' } });
    const markupPercent = feeSetting ? parseFloat(feeSetting.value) : 10;

    // TERMINAL LOG FOR DEBUGGING
    console.log(`--- REVENUE SEARCH ---`);
    console.log(`ID: ${pharmacistId} | Range: ${range} | Since: ${startDate.toISOString()}`);

    const orders = await Order.findAll({
      where: { 
        pharmacistId, 
        status: 'delivered', 
        createdAt: { [Op.gte]: startDate } 
      },
      include: [{ model: Medicine, as: 'medicine', attributes: ['name'] }]
    });

    console.log(`RESULT: Found ${orders.length} orders`);

    let totalRevenue = 0; 
    let adminCommission = 0;
    const breakdownMap = {};

    orders.forEach(order => {
      const total = parseFloat(order.totalPrice);
      const commission = total * (markupPercent / (100 + markupPercent));
      totalRevenue += total; 
      adminCommission += commission;

      const medName = order.medicine?.name || 'Unknown';
      if (!breakdownMap[medName]) breakdownMap[medName] = { name: medName, earnings: 0, count: 0 };
      breakdownMap[medName].earnings += (total - commission);
      breakdownMap[medName].count += order.quantity;
    });

    res.json({
      summary: { 
        totalGross: totalRevenue.toFixed(2), 
        adminFees: adminCommission.toFixed(2), 
        netProfit: (totalRevenue - adminCommission).toFixed(2) 
      },
      breakdown: Object.values(breakdownMap),
      rawOrders: orders
    });
  } catch (err) { 
    console.error("CRITICAL REVENUE ERROR:", err);
    res.status(500).json({ error: err.message }); 
  }
};