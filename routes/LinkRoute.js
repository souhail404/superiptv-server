const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();

const {
    createLink,
    getLinks,
    getLinkById,
    deleteLink,
    updateLink
} = require('../controllers/LinkController');

// CRAETE LINK -ROUTE 
router.post('/create', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, createLink);

// UPDATE LINK -ROUTE 
router.put('/update/:linkId', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, updateLink);

// GET ALL LINKS -ROUTE 
router.get('/', authMiddleware, getLinks);

// GET ONE LINK -ROUTE 
router.get('/:linkId', authMiddleware, getLinkById);

// CRAETE LINK -ROUTE 
router.delete('/:linkId', authMiddleware, isAdmin,  deleteLink);
 


module.exports = router;  