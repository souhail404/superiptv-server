const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();

const {
    createCode,
    getCodes,
    deleteCode,
    getCodeById,
    updateCode
} = require('../controllers/CodeController');

// CRAETE CODE -ROUTE 
router.post('/create', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, createCode);

// UPDATE CODE -ROUTE 
router.put('/update/:codeId', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, updateCode);

// GET ALL CODES -ROUTE 
router.get('/', authMiddleware, getCodes); 

// GET CODE BY ID -ROUTE 
router.get('/:codeId', authMiddleware, getCodeById);

// CRAETE CODE -ROUTE 
router.delete('/:codeId', authMiddleware, isAdmin,  deleteCode);



module.exports = router;