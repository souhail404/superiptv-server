
const asyncHandler = require('express-async-handler');

// models
const SoldHistory = require('../models/SoldHistoryModel');

const getSoldHistory = asyncHandler(async(req, res)=>{
    const {
        paid,
        type,
        userId,   
        page,    
        pageSize,
    } = req.query;  
    // build the query 
    const query = {};

    // User ID filter
    if (userId) {
        query.userId = userId;
    }

    // Tye Filter filter
    if (type) {
        query.$or = [
            { type: { $regex: type, $options: 'i' } },
        ];
    }

    // Tye Filter filter
    if (JSON.parse(paid)===true || JSON.parse(paid)===false) {
        query.paid = JSON.parse(paid);
    }

    // Execute the query to find logs
    let historyQuery = SoldHistory.find(query);

    // Sorting
    const sort = req.query.sort || 'createdAt:desc'  
    if (sort) {
        const [sortField, sortOrder] = sort.split(':');
        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
        historyQuery = historyQuery.sort(sortOptions);
    }
  
    // Fields Limiting
    const fields = req.query.fields || ' '
    if (fields) {
        const selectedFields = fields.split(',').join(' ');
        historyQuery = historyQuery.select(selectedFields);
    }
  
    // Pagination
    const DEFAULT_PAGE_SIZE = 12; 
    const currentPage = parseInt(page) || 1;
    const pageSizeValue = parseInt(pageSize) || DEFAULT_PAGE_SIZE;
    const skipItems = (currentPage - 1) * pageSizeValue;
    historyQuery = historyQuery.skip(skipItems).limit(pageSizeValue);
    
    const logs = await historyQuery.exec();
    
    const totalLogsCount = await SoldHistory.countDocuments(query).exec();

    const totalPages = Math.ceil(totalLogsCount / pageSizeValue);

    if(!logs){
        return res.status(404).json({message:"Sold History Not Found"})
    }
    res.status(200).json({
        totalLogs: totalLogsCount,
        totalPages: totalPages,
        currentPage: currentPage,
        pageSize: pageSizeValue,
        logs: logs,
    });
})


const updateState = asyncHandler(async(req, res)=>{
    try {
        const id = req.params.logId;
        const state = JSON.parse(req.body.paid);
        
        // update the Sold
        await SoldHistory.findOneAndUpdate({_id:id} , {paid:state} , {new:true})
        
        return res.status(200).json({message:"State updated successfully"} );  

    } catch (error) {
        return res.status(500).json({message:"internal server error" , error})
    } 
});

module.exports = {
    getSoldHistory,
    updateState
}