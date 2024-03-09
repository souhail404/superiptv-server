const {
    getNotifications
} = require('../controllers/AdminNotificationsController');

const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

// GET ORDERS -ROUTE 
router.get('/', authMiddleware, isAdmin, getNotifications);

module.exports = router;