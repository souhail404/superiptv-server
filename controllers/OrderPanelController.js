  // dependencies
  const asyncHandler = require('express-async-handler');
  const mongoose = require('mongoose')
  const User = require('../models/UserModel');
  const Panel = require('../models/PanelModel');
  const {OrderPanelModel} = require('../models/OrderModel');
const { AdminNotification } = require('../models/NotificationModel');
  
  
  // Create an order
const createOrder = asyncHandler(async (req, res) => {
    try {  
        var userId = req.user._id;
        const productId = req.body.productId;

        // Only admin can pass order by another user's ID 
        if(req.body.userId && req.user.role === 'admin'){ 
        userId = req.body.userId;
        }
        
        const user = await User.findById(userId);
        const product = await Panel.findById(productId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!product) {
            return res.status(404).json({ message: 'Panel not found' });
        }

        var price = product.price;

        if(user.isLoyal){
            price = product.specialPrice;
        }
        // check if user have enough funds
        if(user.sold < price){
            return res.status(400).json({ message: "You dont have enough funds to buy this product" });
        }

        const data = {
            userId: userId,
            productId : productId,
            userName : user.userName,
            itemName:product.title,
            itemPrice:price,
            phone:req.body.phone,
            itemQuantity:product.quantity,
            panelUserName:req.body.panelUserName
        }
        
        // Create the order
        const newOrder = await OrderPanelModel.create({...data})
        // add order to user
        user.panelsOrders.push(newOrder._id);
        user.sold -= price; 
        user.ordered++;
        user.volume += price;
        await user.save();

        // Update Panel's ordered count
        product.ordered++;
        product.volume += price;
        product.orders.push(newOrder._id)
        await product.save();

        await AdminNotification.create({
            isSeen:false, 
            productId:newOrder._id,
            content:`New panel order (${product.title}) by ${user.userName} at ${price} Dhs`, 
            link:`/orders/panels/${newOrder._id}`,
            type:"order"
        })

        return res.status(200).json({message:'order created successfully', order:newOrder});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Panel error', error});
    }
}); 
  
const getOrders = asyncHandler(async (req, res) => {
    try {
        const {
            state,
            userId,
            productId,
            page,    
            pageSize,
        } = req.query; 

        // build the query 
        const query = {};

    
        // User ID filter
        if (userId) {
            query.userId = userId;
        }

        // Product ID filter
        if (productId) {
            query.productId = productId;
        }

        if (state) {
            query.state = state;
        }
        // Execute the query to find products
        let ordersQuery = OrderPanelModel.find(query);

        // Sorting
        const sort = req.query.sort || 'createdAt:desc'  
        if (sort) {
            const [sortField, sortOrder] = sort.split(':');
            const sortOptions = {};
            sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
            ordersQuery = ordersQuery.sort(sortOptions);
        }
    
        // Fields Limiting
        const fields = req.query.fields || ' ' 
        if (fields) {
            const selectedFields = fields.split(',').join(' ');
            ordersQuery = ordersQuery.select(selectedFields);
        }
    
        // Pagination
        const DEFAULT_PAGE_SIZE = 12; 
        const currentPage = parseInt(page) || 1;
        const pageSizeValue = parseInt(pageSize) || DEFAULT_PAGE_SIZE;
        const skipItems = (currentPage - 1) * pageSizeValue;
        ordersQuery = ordersQuery.skip(skipItems).limit(pageSizeValue);
        
        const orders = await ordersQuery.exec();

        const totalOrdersCount = await OrderPanelModel.countDocuments(query).exec();

        const totalPages = Math.ceil(totalOrdersCount / pageSizeValue);

        if(!orders){
            return res.status(404).json({message:"Orders not found"})
        }
        res.status(200).json({
            totalOrders: totalOrdersCount,
            totalPages: totalPages,
            currentPage: currentPage,
            pageSize: pageSizeValue,
            orders: orders,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Panel error', error});
    }
})
   
const seeOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const makeSeen = await OrderPanelModel.findOneAndUpdate({_id:orderId}, {isSeen:true}, {new:true})

        if (!makeSeen) {
            return res.status(400).json({ message: 'Error updating the order'});
        }
        return res.status(200).json({ message: 'Updated successfully'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Code error', error});
    }
})

const changeOrderState = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const state = req.body.state;


        const updatedOrder = await OrderPanelModel.findOneAndUpdate({_id:orderId}, {state:state}, {new:true})

        if (!updatedOrder) {
            return res.status(400).json({ message: 'Error updating the order'});
        }
        return res.status(200).json({ message: 'Updated successfully'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Code error', error});
    }
})
  
  
  
module.exports = {
    createOrder,
    getOrders,
    seeOrder,
    changeOrderState
}