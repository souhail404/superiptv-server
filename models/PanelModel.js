const mongoose = require('mongoose');

var panelSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    specialPrice:{
        type:Number,
        required:true
    },
    quantity:{
        type:String,
        required:true
    },
    image:{
        url:String,
        publicId:String,
    },
    active:{
        type:Boolean,
        default:true    
    },
    ordered:{
        type:Number,
        default:0,
    },
    orders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"OrderPanel",
        }
    ],
    volume:{
        type:Number,
        required:true,
        default:0
    },
}, 
{
    timestamps:true,
});


//Export the model
module.exports =  mongoose.model('Panel', panelSchema);
