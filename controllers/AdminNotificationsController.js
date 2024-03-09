const asyncHandler = require('express-async-handler');

const {AdminNotification} = require('../models/NotificationModel');


const getNotifications = asyncHandler(async (req, res) => {
    try {
        const {
            page,
            isSeen,
            pageSize,
        } = req.query; 

        // build the query 
        const query = {};
    
        if (isSeen) {
            query.isSeen = isSeen;
        }

        // Execute the query to find products
        let notifsQuery =  AdminNotification.find(query);

        const notSeenNotifs = await AdminNotification.find({isSeen:false});

        // Sorting
        const sort = req.query.sort || 'createdAt:desc'  
        if (sort) {
            const [sortField, sortOrder] = sort.split(':');
            const sortOptions = {};
            sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
            notifsQuery = notifsQuery.sort(sortOptions);
        }
    
        // Fields Limiting
        const fields = req.query.fields || '' 
        if (fields) {
            const selectedFields = fields.split(',').join(' ');
            notifsQuery = notifsQuery.select(selectedFields);
        }
    
        // Pagination
        const DEFAULT_PAGE_SIZE = 8; 
        const currentPage = parseInt(page) || 1;
        const pageSizeValue = parseInt(pageSize) || DEFAULT_PAGE_SIZE;
        const skipItems = (currentPage - 1) * pageSizeValue;
        notifsQuery = notifsQuery.skip(skipItems).limit(pageSizeValue);
        
        const notifications = await notifsQuery.exec();

        const totalNotificationsCount = await AdminNotification.countDocuments(query).exec();

        const totalPages = Math.ceil(totalNotificationsCount / pageSizeValue);

        if(!notifications){
            return res.status(404).json({message:"notifications not found"})
        }
        res.status(200).json({
            totalnotifications: totalNotificationsCount,
            totalPages: totalPages,
            currentPage: currentPage,
            pageSize: pageSizeValue,
            notifications: notifications,
            unSeenCount: notSeenNotifs.length 
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Code error', error});
    }
})


module.exports = {
    getNotifications
}