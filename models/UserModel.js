const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    userName:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type: String,
        enum: ['client', 'admin'],
        default:'client'
    },
    sold:{
        type:Number,
        required:true,
        default:0,
    },
    isActive:{
        type:Boolean,
        required:true,
        default:true
    }, 
    isLoyal:{
        type:Boolean,
        required:true,
        default:false
    },
    volume:{
        type:Number,
        required:true,
        default:0
    },
    serversOrders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"OrderServer",
        }
    ],
    codesOrders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"OrderCode",
        }
    ],
    panelsOrders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"OrderPanel",
        }
    ],
    ordered:{
        type:Number,
        default:0,
    },
}, 
{
    timestamps:true,
});

//Export the model
module.exports = mongoose.model('User', userSchema);