const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();

const {
    createServer,
    getServers,
    deleteServer,
    getServerById,
    updateServer
} = require('../controllers/ServerController');

// CRAETE SERVER -ROUTE 
router.post('/create', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, createServer);

// UPDATE SERVER -ROUTE 
router.put('/update/:serverId', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, updateServer);

// GET ALL SERVERS -ROUTE 
router.get('/', authMiddleware, getServers);

// GET SERVER BY ID -ROUTE 
router.get('/:ServerId', authMiddleware, getServerById);

// CRAETE SERVER -ROUTE 
router.delete('/:ServerId', authMiddleware, isAdmin,  deleteServer);



module.exports = router;