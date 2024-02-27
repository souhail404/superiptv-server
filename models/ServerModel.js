const mongoose = require('mongoose');

var serverSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    period:{
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
            ref:"OrderServer",
        }
    ],
    volume:{
        type:Number,
        required:true,
        default:0
    },
    codes:[
        {
            type:String
        }
    ]
}, 
{
    timestamps:true,
});


//Export the model
module.exports =  mongoose.model('Server', serverSchema);
