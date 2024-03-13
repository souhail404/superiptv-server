// dependencies
const asyncHandler = require('express-async-handler');
const fs = require('fs')
const cloudinaryUploadImg = require('../utils/cloudinary');
const deleteImage = require('../services/DeleteImage')

// models
const Code = require('../models/CodeModel');
const {AdminNotification} = require('../models/NotificationModel');


// CREATE A CODE
const createCode = asyncHandler(async(req, res)=>{
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'image');

        // Upload image
        const file = req.file;
        const {path} = file;
        const uploadRes = await uploader(path);
        const image = uploadRes
        fs.unlinkSync(path);

        const codes = req.body.codes;
        const testCodes = req.body.testCodes;
        
        // create the new user
        const newCode = await Code.create({...req.body, image, codes:codes, testCodes:testCodes});
        
        if(newCode.codes.length <= 3 &&  newCode.codes.length > 0){
            await AdminNotification.create({
                productId:newCode._id,
                isSeen:false, 
                content:`The product (${newCode.title}) is almost out of stock, there is ${newCode.codes.length} codes available.`, 
                link:`/codes/${newCode._id}/edit`,
                type:"stock"
                
            })
        }
        else if(newCode.codes.length === 0){
            await AdminNotification.create({
                isSeen:false, 
                content:`The product (${newCode.title}) is out of stock, there is no code available.`, 
                link:`/codes/${newCode._id}/edit`,
                type:"stock",
                productId:newCode._id,
            })
        }

        return res.status(200).json({message:"code created successfully", newCode}) 
    } catch (error) {
        return res.status(500).json({message:"intrenal server error", error})
    }
});

// GET PRODUCTS // FILTERING 
const getCodes = asyncHandler(async(req, res)=>{
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
    let productsQuery = Code.find(query);

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
    
    const totalProductsCount = await Code.countDocuments(query).exec();

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
const getCodeById = asyncHandler(async(req, res)=>{
    try {
        const codeId = req.params.codeId
        if(!codeId){
            return res.status(400).json({message:"The Product id must be in the URL"})
        }
        const product = await Code.findById(codeId);
        if(!product){
            return res.status(404).json({message:"Product not found"})
        }
        res.json({product})
    } catch (error) {
        return res.status(500).json({message:"Internal server error", error})
    }
})

// UPDATE CODE
const updateCode = asyncHandler(async(req, res)=>{
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'image');

        const codeId = req.params.codeId;
        if(!codeId){
            return res.status(400).json({message:'you must pass the code id in the url'})
        }
        const codeToUpdate = await Code.findById(codeId); 

        if(!codeToUpdate){
            return res.status(404).json({message:'Code Not found'})
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
        const sepcialPrice = req.body.specialPrice;
        const codes = req.body.codes;
        const testCodes = req.body.testCodes;
        var image = codeToUpdate.image;

        if (newImage) {
            image= newImage;
            // delete prev images
            const prevImage = codeToUpdate.image;
            if (prevImage) {
                await deleteImage(prevImage.publicId);
            }
        }

        codeToUpdate.title= title;
        codeToUpdate.price= price;
        codeToUpdate.specialPrice= sepcialPrice;
        codeToUpdate.codes= codes;
        codeToUpdate.testCodes= testCodes;
        codeToUpdate.image= image;
        // update link
        await codeToUpdate.save();

        if(codeToUpdate.codes.length <= 3 &&  codeToUpdate.codes.length > 0){
            await AdminNotification.findOneAndDelete({type:"stock", productId:codeToUpdate._id});
            await AdminNotification.create({
                isSeen:false, 
                content:`The product (${codeToUpdate.title}) is almost out of stock, there is ${codeToUpdate.codes.length} codes available.`, 
                link:`/codes/${codeToUpdate._id}/edit`,
                type:"stock",
                productId:codeToUpdate._id
            })
        }
        else if(codeToUpdate.codes.length === 0){
            await AdminNotification.findOneAndDelete({type:"stock", productId:codeToUpdate._id});
            await AdminNotification.create({
                isSeen:false, 
                content:`The product (${codeToUpdate.title}) is out of stock, there is no code available.`, 
                link:`/codes/${codeToUpdate._id}/edit`,
                type:"stock",
                productId:codeToUpdate._id
            })
        }
        else{
            await AdminNotification.findOneAndDelete({type:"stock", productId:codeToUpdate._id});
        }

        return res.status(200).json({message:"Updated Successfully"})

    } catch (error) {
        res.status(500).json({message:'internal server error', error});
    }   
});

// DELETE CODE 
const deleteCode = asyncHandler(async(req, res)=>{
    try {
        const codeId = req.params.codeId;
        if(!codeId){
            return res.status(400).json({message:'you must pass the product id in the url'})
        }
        const product = await Code.findById(codeId);
        if(!product){
            return res.status(404).json({message:'Product Not found'})
        }
        // delete images
        const image = product.image;
        if (image) {
           await deleteImage(image.publicId);
        }
        console.log(image);
        // delete product
        const deletedProduct = await Code.findOneAndDelete({_id:codeId});
        if(!deletedProduct){
            return res.status(400).json({message:'error while deleting product'})
        }
        res.status(200).json({message:'Product deleted successfully', deletedProduct});    
    } catch (error) {
        res.status(500).json({message:'internal server error', error});
    }   
});


module.exports = {
    createCode,
    deleteCode,
    getCodes,
    getCodeById,
    updateCode
}