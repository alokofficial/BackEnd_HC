import {v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        //upload the file to cloudinary
        const result = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
        });
        //file has been uploaded successfully
        console.log('File has been uploaded successfully',result.url);
        return result
    }catch(error){
        fs.unlinkSync(localFilePath); //remove the locally saved temp file if upload operation failed
        return null
    }
}

export {uploadOnCloudinary}