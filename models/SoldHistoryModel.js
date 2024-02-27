const mongoose = require('mongoose');

var soldHistorySchema = new mongoose.Schema({
    amount:{
        type:Number,
        required:true,
    },
    type:{
        type: String,
        enum: ['add', 'subtract'],
        required:true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    }, 
    paid:{
        type:Boolean,
        default:false,
        required:true,
    },
}, 
{
    timestamps:true,
});

//Export the model
module.exports = mongoose.model('SoldHistory', soldHistorySchema);