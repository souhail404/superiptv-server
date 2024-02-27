const {
    createOrder,
    getOrders,
    seeOrder,
    validOrder
} = require('../controllers/OrderCodeController');

const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

// CREATE ORDER -ROUTE 
router.post('/create', authMiddleware, createOrder);

// GET ORDERS -ROUTE 
router.get('/', authMiddleware, isAdmin, getOrders);

// MAKE ORDER SEEN -ROUTE 
router.put('/seen/:orderId', authMiddleware, isAdmin, seeOrder);

// ORDER VALIDATION UPDATE -ROUTE 
router.put('/valid/:orderId', authMiddleware, isAdmin, validOrder);


module.exports = router;