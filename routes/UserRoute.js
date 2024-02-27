// import controllers
const {
    createUser,
    getUsers,
    loginUser, 
    updateUser, 
    deleteUser,
    getUserById,
    loginAdmin,
    resetPassword,
    updateSold
} = require('../controllers/UserController');


const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

// CRAETE USER -ROUTE 
router.post('/register', createUser)

// LOGIN USER -ROUTE 
router.post('/login', loginUser)

// LOGIN ADMIN -ROUTE 
router.post('/admin-login', loginAdmin)

// GET ALL USERS -ROUTE 
router.get('/', authMiddleware, isAdmin , getUsers)

// GET USER BY ID -ROUTE 
router.get('/id/:userId', authMiddleware, isAdmin , getUserById)

// UPDATE USER -ROUTE 
router.put('/update/:userId', authMiddleware, isAdmin, updateUser)

// UPDATE USER -ROUTE 
router.put('/update-sold/:userId', authMiddleware, isAdmin, updateSold)

// RESET PASSWORD -ROUTE 
router.put('/reset-password/:userId', authMiddleware, resetPassword) 

// DELETE USER -ROUTE 
router.delete('/:userId', authMiddleware , deleteUser)

module.exports = router;