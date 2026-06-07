const Tracker = require('../models/tracker.model');
const { Op, fn, col } = require('sequelize');

exports.updateDailyTracker = async (req, res) => {
    try {
        const { userId, waterIntake, calories, meals } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const [tracker, created] = await Tracker.findOrCreate({
            where: { userId, date: today },
            defaults: { waterIntake, calories, meals }
        });

        if (!created) {
            await tracker.update({ waterIntake, calories, meals });
        }

        res.json({ message: "Tracker updated", tracker });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTrackerHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { filter } = req.query; // week, month, year
        let startDate = new Date();

        if (filter === 'month') startDate.setMonth(startDate.getMonth() - 1);
        else if (filter === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
        else startDate.setDate(startDate.getDate() - 7); // Default week

        const history = await Tracker.findAll({
            where: {
                userId,
                date: { [Op.gte]: startDate.toISOString().split('T')[0] }
            },
            order: [['date', 'ASC']]
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};