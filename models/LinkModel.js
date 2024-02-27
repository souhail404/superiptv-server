const mongoose = require('mongoose');

var linkSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    link:{
        type:String,
        required:true
    },
    category:{
        type:String,
        enum: ['playlist', 'application', 'panel'],
        required:true,
    },
    image:{
        url:String,
        publicId:String,
    },
    
}, 
{
    timestamps:true,
});


//Export the model
module.exports =  mongoose.model('Link', linkSchema);
