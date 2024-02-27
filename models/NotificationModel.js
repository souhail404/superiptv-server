const mongoose = require('mongoose');

var notificationSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true 
    },
    isSeen:{
        type:Boolean,
        required:true,
        default:false
    },
    link:{
        type:String,
    },
},
{
    timestamps:true,
})

module.exports =  mongoose.model('Notification', notificationSchema);