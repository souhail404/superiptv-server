const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
})

const cloudinaryUploadImg = async(file)=>{
    return new Promise((resolve)=>{
        cloudinary.uploader.upload(file, (result)=>{
            resolve(
                {
                    publicId: result.public_id,
                    url:result.secure_url,
                },
                {
                    resource_type: "auto",
                } 
            )
        })
    })
}

module.exports = cloudinaryUploadImg