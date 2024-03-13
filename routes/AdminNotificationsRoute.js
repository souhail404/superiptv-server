const {
    getNotifications,
    seeNotification,
    deleteNotification
} = require('../controllers/AdminNotificationsController');

const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

// GET NOTIFICATIONS -ROUTE 
router.get('/', authMiddleware, isAdmin, getNotifications);

// SEE NOTIFICATION -ROUTE 
router.put('/seen/:notifId', authMiddleware, isAdmin, seeNotification);

// DELETE NOTIFICATION -ROUTE 
router.delete('/:notifId', authMiddleware, isAdmin, deleteNotification);

module.exports = router;