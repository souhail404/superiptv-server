// dependencies
const asyncHandler = require('express-async-handler');
const fs = require('fs')
const cloudinaryUploadImg = require('../utils/cloudinary');
const deleteImage = require('../services/DeleteImage')

// models   
const Link = require('../models/LinkModel');

// CREATE A LINK
const createLink = asyncHandler(async(req, res)=>{
    try { 
        const uploader = (path) => cloudinaryUploadImg(path, 'image');

        // Upload image
        const file = req.file;
        const {path} = file;
        const uploadRes = await uploader(path);
        const image = uploadRes
        fs.unlinkSync(path);

        const category = req.body.category;
        const link = req.body.link;
        const name = req.body.name;

        if (!name || !category || !link) {
            return res.status(404).json({message:"All the Fields are required"}) 
        }

        // create the new user
        const newLink = await Link.create({...req.body, image});

        return res.status(200).json({message:"Link created successfully", newLink}) 
    } catch (error) {
        return res.status(500).json({message:"intrenal server error", error})
    }
});

// GET LINKs // FILTERING 
const getLinks = asyncHandler(async(req, res)=>{
    const {
        category,
        search,   
        page,    
        pageSize,
    } = req.query;  
    // build the query 
    const query = {};

  
    // Keywords/Search filter
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
        ];
    }

    if (category) {
        query.category = category;
    }

    // Execute the query to find products
    let linksQuery = Link.find(query);

    // Sorting
    const sort = req.query.sort || 'createdAt:desc'  
    if (sort) {
        const [sortField, sortOrder] = sort.split(':');
        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
        linksQuery = linksQuery.sort(sortOptions);
    }
  
    // Fields Limiting
    const fields = req.query.fields || ' ' // || 'title,mini_description,description,stock,price,liked';
    if (fields) {
        const selectedFields = fields.split(',').join(' ');
        linksQuery = linksQuery.select(selectedFields);
    }
  
    // Pagination
    const DEFAULT_PAGE_SIZE = 12; 
    const currentPage = parseInt(page) || 1;
    const pageSizeValue = parseInt(pageSize) || DEFAULT_PAGE_SIZE;
    const skipItems = (currentPage - 1) * pageSizeValue;
    linksQuery = linksQuery.skip(skipItems).limit(pageSizeValue);
    
    const links = await linksQuery.exec();
    
    const totalLinksCount = await Link.countDocuments(query).exec();

    const totalPages = Math.ceil(totalLinksCount / pageSizeValue);

    if(!links){
        return res.status(404).json({message:"Links not found"})
    }
    res.status(200).json({
        totalProducts: totalLinksCount,
        totalPages: totalPages,
        currentPage: currentPage,
        pageSize: pageSizeValue,
        links: links,
    });
})

// GET LINK // FILTERING 
const getLinkById= asyncHandler(async(req, res)=>{
    try {
        const linkId = req.params.linkId
        
        if(!linkId){
            return res.status(400).json({message:'you must pass the link id in the url'})
        }
        const link = await Link.findById(linkId);

        if(!link){
            return res.status(404).json({message:'Link Not Found'});
        }
        
        return res.status(200).json({link})
        
    } catch (error) {
        return res.status(500).json({message:'internal server error', error});
    }
  
    
})

const updateLink = asyncHandler(async(req, res)=>{
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'image');

        const linkId = req.params.linkId;
        if(!linkId){
            return res.status(400).json({message:'you must pass the link id in the url'})
        }
        const linkToUpdate = await Link.findById(linkId); 

        if(!linkToUpdate){
            return res.status(404).json({message:'Link Not found'})
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
        

        const category = req.body.category;
        const link = req.body.link;
        const name = req.body.name;
        var image = linkToUpdate.image;

        if (newImage) {
            image= newImage;
            // delete prev images
            const prevImage = linkToUpdate.image;
            if (prevImage) {
                await deleteImage(prevImage.publicId);
            }
        }


        if (!name || !category || !link) {
            return res.status(404).json({message:"All the Fields are required"}) 
        }

        linkToUpdate.name= name;
        linkToUpdate.link= link;
        linkToUpdate.category= category;
        linkToUpdate.image= image;
        // update link
        await linkToUpdate.save();

        return res.status(200).json({message:"Updated Successfully"})

    } catch (error) {
        res.status(500).json({message:'internal server error', error});
    }   
});


// DELETE LINK 
const deleteLink = asyncHandler(async(req, res)=>{
    try {
        const linkId = req.params.linkId;
        if(!linkId){
            return res.status(400).json({message:'you must pass the link id in the url'})
        }
        const link = await Link.findById(linkId);
        if(!link){
            return res.status(404).json({message:'Link Not found'})
        }
        // delete images
        const image = link.image;
        if (image) {
           await deleteImage(image.publicId);
        }

        // delete product
        const deletedLink = await Link.findOneAndDelete({_id:linkId});
        if(!deletedLink){
            return res.status(400).json({message:'error while deleting link'})
        }
        res.status(200).json({message:'Link deleted successfully', deletedLink});    
    } catch (error) {
        res.status(500).json({message:'internal server error', error});
    }   
});


module.exports = {
    createLink,
    getLinks,
    deleteLink,
    getLinkById,
    updateLink
}