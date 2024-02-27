const mongoose = require('mongoose');

var codeSchema = new mongoose.Schema({
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
            ref:"OrderCode",
        }
    ],
    codes:[
        {
            type:String
        }
    ],
    volume:{
        type:Number,
        required:true,
        default:0
    },
    testCodes:[
        {
            type:String
        }
    ],
}, 
{
    timestamps:true,
});


//Export the model
module.exports =  mongoose.model('Code', codeSchema);
