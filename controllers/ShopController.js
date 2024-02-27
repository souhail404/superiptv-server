const asyncHandler = require('express-async-handler');

// models
const {OrderServerModel, OrderCodeModel, OrderPanelModel} = require('../models/OrderModel');

const getOrdersLength = asyncHandler(async(req, res) =>{
    try {
        const serverOrders = await OrderServerModel.find({isSeen:false})
        const codeOrders = await OrderCodeModel.find({isSeen:false})
        const panelOrders = await OrderPanelModel.find({isSeen:false})

        const serverOrdersLength = serverOrders.length;
        const codeOrdersLength = codeOrders.length;
        const panelOrdersLength = panelOrders.length;

        const totalOrdersLength = serverOrdersLength + codeOrdersLength + panelOrdersLength;

        res.status(200).json({
            serverOrdersLength,
            codeOrdersLength,
            panelOrdersLength,
            totalOrdersLength
        })
    } catch (error) {
        return res.status(500).json({message:"Internal server error", error})
    }
});

module.exports = {
    getOrdersLength
}