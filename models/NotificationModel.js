const mongoose = require('mongoose');

var adminNotificationSchema = new mongoose.Schema({
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


var clientNotificationSchema = new mongoose.Schema({
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


const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);
const ClientNotification = mongoose.model('ClientNotification', clientNotificationSchema);

module.exports =  {AdminNotification, ClientNotification};