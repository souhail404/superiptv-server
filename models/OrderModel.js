const mongoose = require('mongoose');

var orderServerSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Server",
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    userName:String,
    itemPeriod:String,
    itemName:String,
    itemPrice:Number,
    code:String,
    isSeen:{
        type:Boolean,
        default:false,   
    },
    note:String,
    isValid:{
        type:Boolean,
        default:true,   
    }
}, 
{
    timestamps:true,
});


var orderCodeSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Code",
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    }, 
    userName:String,
    itemPeriod:String,
    itemName:String,
    itemPrice:Number,
    code:String,
    isSeen:{
        type:Boolean,
        default:false,   
    },
    note:String,
    isValid:{
        type:Boolean,
        default:true,   
    }
}, 
{
    timestamps:true,
});

var orderPanelSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Panel",
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    }, 
    userName:String,
    phone:{
        type:String,
        required:true,   
    },
    itemQuantity:Number,
    itemName:String,
    itemPrice:Number,
    panelUserName:{
        type:String,
        required:true,   
    },
    isSeen:{
        type:Boolean,
        default:false,   
    },
    note:String,
    state:{
        type:String,
        enum: ['canceled', 'payed', 'processing'],
        default:'processing',
        required:true,
    }
}, 
{
    timestamps:true,
});

//Export the model
const OrderServerModel = mongoose.model('OrderServer', orderServerSchema);
const OrderCodeModel = mongoose.model('OrderCode', orderCodeSchema);
const OrderPanelModel = mongoose.model('OrderPanel', orderPanelSchema);

module.exports = {OrderServerModel , OrderCodeModel, OrderPanelModel}