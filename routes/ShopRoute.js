const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

const {
    getOrdersLength
} = require('../controllers/ShopController');


// GET ALL SERVERS -ROUTE 
router.get('/', authMiddleware, isAdmin, getOrdersLength);




module.exports = router;