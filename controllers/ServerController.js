// dependencies
const asyncHandler = require('express-async-handler');
const fs = require('fs')
const cloudinaryUploadImg = require('../utils/cloudinary');
const deleteImage = require('../services/DeleteImage')

// models
const Server = require('../models/ServerModel');

// CREATE A Server
const createServer = asyncHandler(async(req, res)=>{ 
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'image');

        // Upload image
        const file = req.file;
        const {path} = file;
        const uploadRes = await uploader(path); 
        const image = uploadRes
        fs.unlinkSync(path);

        const codes = req.body.codes;

        // create the new user
        const newServer = await Server.create({...req.body, image, codes});
        console.log(newServer);
        return res.status(200).json({message:"Server created successfully", newServer}) 
    } catch (error) {
        return res.status(500).json({message:"intrenal server error", error})
    }
});

// GET PRODUCTS // FILTERING 
const getServers = asyncHandler(async(req, res)=>{
    const {
        search,   
        page,    
        pageSize,
    } = req.query;  
    // build the query 
    const query = {};

  
    // Keywords/Search filter
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
        ];
    }

    // Execute the query to find products
    let productsQuery = Server.find(query);

    // Sorting
    const sort = req.query.sort || 'createdAt:desc'  
    if (sort) {
        const [sortField, sortOrder] = sort.split(':');
        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
        productsQuery = productsQuery.sort(sortOptions);
    }
  
    // Fields Limiting
    const fields = req.query.fields || ' ' // || 'title,mini_description,description,stock,price,liked';
    if (fields) {
        const selectedFields = fields.split(',').join(' ');
        productsQuery = productsQuery.select(selectedFields);
    }
  
    // Pagination
    const DEFAULT_PAGE_SIZE = 12; 
    const currentPage = parseInt(page) || 1;
    const pageSizeValue = parseInt(pageSize) || DEFAULT_PAGE_SIZE;
    const skipItems = (currentPage - 1) * pageSizeValue;
    productsQuery = productsQuery.skip(skipItems).limit(pageSizeValue);
    
    const products = await productsQuery.exec();
    
    const totalProductsCount = await Server.countDocuments(query).exec();

    const totalPages = Math.ceil(totalProductsCount / pageSizeValue);

    if(!products){
        return res.status(404).json({message:"Products not found"})
    }
    res.status(200).json({
        totalProducts: totalProductsCount,
        totalPages: totalPages,
        currentPage: currentPage,
        pageSize: pageSizeValue,
        products: products,
    });
})

// GET PRODUCTS // FILTERING 
const getServerById = asyncHandler(async(req, res)=>{
    try {
        const ServerId = req.params.ServerId
        if(!ServerId){
            return res.status(400).json({message:"The Product id must be in the URL"})
        }
        const product = await Server.findById(ServerId);
        if(!product){
            return res.status(404).json({message:"Product not found"})
        }
        res.status(200).json({product})
    } catch (error) {
        return res.status(500).json({message:"Internal server error", error})
    }
})

// UPDATE SERVER
const updateServer = asyncHandler(async(req, res)=>{
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'image');

        const serverId = req.params.serverId;
        if(!serverId){
            return res.status(400).json({message:'you must pass the server id in the url'})
        }
        const serverToUpdate = await Server.findById(serverId); 

        if(!serverToUpdate){
            return res.status(404).json({message:'Server Not found'})
        }

        var newImage

        // Upload image
        if (req.file) {
            const file = req.file;
            const {path} = file;
            const uploadRes = await uploader(path);
            newImage = uploadRes
            fs.unlinkSync(path);
        }
        

        const title = req.body.title;
        const price = req.body.price;
        const period = req.body.period;
        const codes = req.body.codes;
        var image = serverToUpdate.image;

        if (newImage) {
            image= newImage;
            // delete prev images
            const prevImage = serverToUpdate.image;
            if (prevImage) {
                await deleteImage(prevImage.publicId);
            }
        }

        serverToUpdate.title= title;
        serverToUpdate.price= price;
        serverToUpdate.period= period;
        serverToUpdate.codes= codes;
        serverToUpdate.image= image;
        // update link
        await serverToUpdate.save();

        return res.status(200).json({message:"Updated Successfully"})

    } catch (error) {
        res.status(500).json({message:'internal server error', error});
    }   
});

// DELETE Server 
const deleteServer = asyncHandler(async(req, res)=>{
    try {
        const ServerId = req.params.ServerId;
        if(!ServerId){
            return res.status(400).json({message:'you must pass the server id in the url'})
        }
        const product = await Server.findById(ServerId);
        if(!product){
            return res.status(404).json({message:'Server Not found'})
        }
        // delete images
        const image = product.image;
        if (image) {
           await deleteImage(image.publicId);
        }
        // delete product
        const deletedProduct = await Server.findOneAndDelete({_id:ServerId});
        if(!deletedProduct){
            return res.status(400).json({message:'error while deleting product'})
        }
        res.status(200).json({message:'Product deleted successfully', deletedProduct});    
    } catch (error) {
        res.status(500).json({message:'internal server error', error});
    }   
});


module.exports = {
    createServer,
    deleteServer,
    getServers,
    updateServer,
    getServerById
}