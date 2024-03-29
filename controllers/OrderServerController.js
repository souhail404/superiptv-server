// dependencies
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose')
const User = require('../models/UserModel');
const Server = require('../models/ServerModel');
const {OrderServerModel} = require('../models/OrderModel');
const {AdminNotification} = require('../models/NotificationModel');



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
    const product = await Server.findById(productId)

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (!product) {
        return res.status(404).json({ message: 'Server not found' });
    }

    var price = product.price;

    if(user.isLoyal){
        price = product.price;
    }
    // check if user have enough funds
    if(user.sold < price){
        return res.status(400).json({ message: "You dont have enough funds to buy this product" });
    }

    if(product.codes.length === 0){
        return res.status(400).json({ message: "No available codes for this server" });
    }

    // Get the first available code
    const code = product.codes[0];

    if (!code) {
        return res.status(400).json({ error: 'No available codes for this server' });
    }

    const data = {
        userId: userId,
        productId : productId,
        userName : user.userName,
        itemPeriod:product.period,
        itemName:product.title,
        itemPrice:price,
        code:code,
    }
    
    // Create the order
    const newOrder = await OrderServerModel.create({...data})
    // add order to user
    user.serversOrders.push(newOrder._id);
    user.sold -= price; 
    user.ordered++;
    user.volume += price;
    await user.save();

    // Update server's ordered count
    product.codes.splice(0, 1);
    product.ordered++;
    product.volume += price;
    product.orders.push(newOrder._id)
    await product.save();

    await AdminNotification.create({
        isSeen:false, 
        productId:newOrder._id,
        content:`${user.userName} ordered a server "${product.title}" for ${price} Dhs`, 
        link:`/orders/servers/`,
        type:"order"
    })

    if(product.codes.length <= 3 &&  product.codes.length > 0){
        await AdminNotification.findOneAndDelete({type:"stock", productId:product._id});
        await AdminNotification.create({ 
            isSeen:false, 
            productId:product._id,
            content:`The product "${product.title}" is almost out of stock, there is ${product.codes.length} codes available.`, 
            link:`/servers/${product._id}/edit`,
            type:"stock"
        })  
    }
    else if(product.codes.length === 0){
        await AdminNotification.findOneAndDelete({type:"stock", productId:product._id});
        await AdminNotification.create({ 
            isSeen:false, 
            productId:product._id,
            content:`The product "${product.title}" is out of stock, there is no code available.`, 
            link:`/servers/${product._id}/edit`,
            type:"stock"
        })
    }

    return res.status(200).json({message:'order created successfully', order:newOrder});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error', error});
  }
}); 

const getOrders = asyncHandler(async (req, res) => {
    try {
        const {
            search,
            isValid,
            userId,
            productId,
            page,    
            pageSize,
        } = req.query; 

        // build the query 
        const query = {};

        // code/Search filter
        if (search) {
            query.$or = [
                { code: { $regex: search, $options: 'i' } },
            ];
        }

        // User ID filter
        if (userId) {
            query.userId = userId;
        }

        // Product ID filter
        if (productId) {
            query.productId = productId;
        }

        if (isValid) {
            query.isValid = isValid;
        }

        // Execute the query to find products
        let ordersQuery = OrderServerModel.find(query);

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

        const totalOrdersCount = await OrderServerModel.countDocuments(query).exec();

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
        return res.status(500).json({ message: 'Internal server error', error});
    }
})
 
const seeOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.orderId;

        console.log(orderId);
        const makeSeen = await OrderServerModel.findOneAndUpdate({_id:orderId}, {isSeen:true}, {new:true})

        if (!makeSeen) {
            return res.status(400).json({ message: 'Error updating the order'});
        }
        return res.status(200).json({ message: 'Updated successfully'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Code error', error});
    }
})

const validOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const isValid = JSON.parse(req.body.isValid);

        const updatedOrder = await OrderServerModel.findOneAndUpdate({_id:orderId}, {isValid:isValid}, {new:true})

        if (!updatedOrder) {
            return res.status(400).json({ message: 'Error updating the order'});
        }
        return res.status(200).json({ message: 'Updated successfully'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Code error', error});
    }
})

const editCode = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const code = req.body.code;

        const updatedOrder = await OrderServerModel.findOneAndUpdate({_id:orderId}, {code:code}, {new:true})

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
    validOrder,
    editCode
}