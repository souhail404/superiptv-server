// dependencies
const asyncHandler = require('express-async-handler');
const {generateToken} = require('../config/jwtToken')
const bcrypt = require('bcrypt')
// models
const User = require('../models/UserModel');
const SoldHistory = require('../models/SoldHistoryModel');

// CREATE A USER
const createUser = asyncHandler(async(req, res)=>{
    try { 
        // check if username already exists
        const userName = req.body.userName;
       
        const existUserName = await User.findOne({userName:userName});
        if(existUserName){
            return res.status(400).json({message:"the username you entred already exist !"})
        };

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        // create the new user
        const newUser = await User.create({...req.body, password:hashedPassword });
        return res.status(200).json({message:"user created successfully", newUser})
    } catch (error) {
        return res.status(500).json({message:"intrenal server error", error})
    }
});

// Login USER
const loginUser = asyncHandler(async(req, res)=>{
    try{
        // check if already connected
        if(req.headers.authorization){
            return res.status(404).json({error:'you are already connected, please logout !'});
        };

        // find the user by email, username or mobile
        const userName = req.body.userName;

        const user = await User.findOne({userName:userName})

        if(!user){
            return res.status(404).json({message:'user not found'});
        }    

        // check if the password match 
        const isPassworCorrect = await bcrypt.compare(req.body.password, user.password);

        if(!isPassworCorrect){
            return res.status(400).json({message:'incorrect password'});  
        }

        res.status(200).json({
            id:user._id,
            user:user.userName,
            role:user.role,
            token:generateToken(user._id)
        })
    }
    catch(err){
        return res.status(500).json({message:'server error', error:err});
    }
})

// admin login
const loginAdmin = asyncHandler(async(req, res)=>{
    try{
        // check if already connected
        if(req.headers.authorization){
            return res.status(404).json({message:'You are already connected, please logout !'});
        };

        // find the user by username
        const userName = req.body.userName;

        const user = await User.findOne({userName:userName})

        if(!user){
            return res.status(404).json({message:'user not found'});
        } 
        // check if admin   
        if (user.role !== 'admin') {
            return res.status(400).json({message:'you are not an admin'});
        }
        // check if the password match 
        const isPassworCorrect = await bcrypt.compare(req.body.password, user.password)
        if(!isPassworCorrect){
            return res.status(400).json({message:'Password incorrect'});
        }
        res.status(200).json({
            id:user._id,
            user:user.userName,
            role:user.role,
            token:generateToken(user._id)
        })
    }
    catch(err){
        return res.status(500).json({msg:'server error', error:err});
    }
})

// FIND ALL USERS
const getUsers = asyncHandler(async(req, res)=>{
    try {
        const {
            type,
            search,   
            page,    
            pageSize,
        } = req.query;  

        // build the query 
        const query = {};

        // Tye Filter filter
        if (type) {
            query.$or = [
                { role: { $regex: type, $options: 'i' } },
            ];
        }

        // Keywords/Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } },
            ];
        }

        // Execute the query to find products
        let usersQuery = User.find(query);

        // Sorting
        const sort = req.query.sort || 'createdAt:desc'  
        if (sort) {
            const [sortField, sortOrder] = sort.split(':');
            const sortOptions = {};
            sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
            usersQuery = usersQuery.sort(sortOptions);
        }
        
        // Fields Limiting
        const fields = req.query.fields || ' ' // || 'title,mini_description,description,stock,price,liked';
        if (fields) {
            const selectedFields = fields.split(',').join(' ');
            usersQuery = usersQuery.select(selectedFields);
        }
        
        // Pagination
        const DEFAULT_PAGE_SIZE = 12; 
        const currentPage = parseInt(page) || 1;
        const pageSizeValue = parseInt(pageSize) || DEFAULT_PAGE_SIZE;
        const skipItems = (currentPage - 1) * pageSizeValue;
        usersQuery = usersQuery.skip(skipItems).limit(pageSizeValue);
        
        const users = await usersQuery.exec();
        
        const totalUsersCount = await User.countDocuments(query).exec();

        const totalPages = Math.ceil(totalUsersCount / pageSizeValue);
        
        if(!users){
            return res.status(404).json({message:"Users not found"})
        }
        res.status(200).json({
            totalUsers: totalUsersCount,
            totalPages: totalPages,
            currentPage: currentPage,
            pageSize: pageSizeValue,
            users: users,
        });
    } catch (error) { 
        return res.status(500).json({message:'intenal server error', error:error})
    }
})

// FIND ALL USERS
const getUserById = asyncHandler(async(req, res)=>{
    try {
        const {userId} = req.params;
        const user = await User.findById(userId);
        if(!user){ 
            return res.status(404).json({message:'User not found'})
        } 
        return res.status(200).json({user})
    } catch (error) {
        return res.status(500).json({message:'intenal server error', error:error})
    }
})


// UPDATE USER 
const updateUser = asyncHandler(async(req, res)=>{
    try {
        const id = req.params.userId;
        
        const username = req.body.userName;

        

        const user = await User.findById(id);

        if(!user){
            return res.status(404).json({message:"User not Found"})
        }

        const existUsername = await User.findOne({userName:username});

        if(existUsername && existUsername._id.toHexString()!==id.toString()){
            return res.status(400).json({message:"the username you entred already exist !"})
        };

        var hashedPassword = user.password;

        if(req.body.password){
            hashedPassword = await bcrypt.hash(req.body.password, 10)
        }

        // update the user
        await User.findOneAndUpdate({_id:id} , {...req.body, password:hashedPassword});
        
        
        return res.status(200).json({message:"Updated Successfully" });  

    } catch (error) {
        return res.status(500).json({message:"internal server error" , error})
    } 
});

const updateSold = asyncHandler(async(req, res)=>{
    try {
        const id = req.params.userId;
        const amount = Number(req.body.amount);
        const isAdd = JSON.parse(req.body.isAdd);
        var type = 'add';
        var content = ``;
        // update the user
        const user = await User.findById(id);

        if(!user){
            return res.status(400).json({message:"user Not Found"});
        }
        if(isAdd){
            type = 'add';
            user.sold += amount;
        }
        if(!isAdd){
            type = 'subtract';
            if(user.sold < amount){
                return res.status(400).json({message:"The Amount You Wanna Subtract Is Bigger Than User Sold"});
            }
            user.sold -= amount;
        }
        
        await user.save()

        await SoldHistory.create({amount, type, userId:id, paid:false})

        return res.status(200).json({message:"user updated successfully"});  

    } catch (error) {
        return res.status(500).json({message:"internal server error" , error})
    } 
});


// RESET USER PASSWORD
const resetPassword = asyncHandler(async(req, res)=>{
    try {
        const userId = req.params.userId;
        const {currentPassword, newPassword, newPasswordTwo} = req.body;
        // check the ownership or admin
        if(String(req.user._id) !== String(userId) && req.user.role !== 'admin'){
            return res.status(400).json({message:'You are not authorized to update this user'})
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message:'User not found'})
        }
        if (newPassword !== newPasswordTwo) {
            return res.status(400).json({message:"New Password doesn't match with confirmation"})
        }
        // check if password correct
        const isPassworCorrect = await bcrypt.compare(currentPassword, user.password)
        if (!isPassworCorrect) {
            return res.status(400).json({message:'Password you entred is incorrect'})
        } 
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save(); 
        return res.status(200).json({message:"Password updated successfully"})
    } catch (error) {
        return res.status(500).json({message:"internal server error" , error})
    }
});

// DELETE USER 
const deleteUser = asyncHandler(async(req, res)=>{
    try{
        const id = req.params.userId;
        // check the ownership or admin
        if(String(req.user._id) !== String(id) && req.user.role !== 'admin'){
            return res.status(400).json({message:'you are not authorized to delete this user'})
        }
        // delete user
        const deletedUser = await User.findOneAndDelete({_id:id}); 
        if(!deletedUser){
            return res.status(400).json({message:'error while Deleting user'})
        } 
        return res.status(200).json({message:'User deleted successfully', deletedUser})
    }
    catch(error){
        return res.status(500).json({message:'internal server error', error})
    }
});


module.exports = {
    createUser,
    getUsers,
    loginUser, 
    updateUser, 
    deleteUser,
    getUserById,
    loginAdmin,
    resetPassword,
    updateSold
}