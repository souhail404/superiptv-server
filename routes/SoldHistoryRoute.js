// import controllers
const {
    getSoldHistory,
    updateState
} = require('../controllers/SoldHistoryController');


const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();


// GET ALL HISTORY -ROUTE 
router.get('/', authMiddleware, isAdmin , getSoldHistory)

router.put('/state/:logId', authMiddleware, isAdmin , updateState)

module.exports = router;