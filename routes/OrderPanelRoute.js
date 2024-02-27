const {
    createOrder,
    getOrders,
    seeOrder,
    changeOrderState
} = require('../controllers/OrderPanelController');

const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

// CREATE ORDER -ROUTE 
router.post('/create', authMiddleware, createOrder);

// GET ORDERS -ROUTE 
router.get('/', authMiddleware, isAdmin, getOrders);

// MAKE ORDER SEEN -ROUTE 
router.put('/seen/:orderId', authMiddleware, isAdmin, seeOrder);

// CHNAGE ORDER STATE -ROUTE 
router.put('/state/:orderId', authMiddleware, isAdmin, changeOrderState);

module.exports = router;