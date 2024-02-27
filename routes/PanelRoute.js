const express = require('express');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');
const router = express.Router();

const {
    createPanel,
    getPanels,
    deletePanel,
    getPanelById,
    updatePanel
} = require('../controllers/PanelController');

// CRAETE PANEL -ROUTE 
router.post('/create', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, createPanel);

// CRAETE PANEL -ROUTE 
router.put('/update/:panelId', authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, updatePanel);

// GET ALL PANELS -ROUTE 
router.get('/', authMiddleware, getPanels);

// GET PANEL BY ID -ROUTE 
router.get('/:panelId', authMiddleware, getPanelById);

// DELETE PANEL -ROUTE 
router.delete('/:panelId', authMiddleware, isAdmin,  deletePanel);



module.exports = router;