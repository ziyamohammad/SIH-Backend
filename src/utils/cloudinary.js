import {v2 as cloudinary} from "cloudinary"
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

const uploadcloudinary = async function(localfilepath){
    try{
      if(!localfilepath) return null
      const response = await cloudinary.uploader.upload(localfilepath,{
        resource_type:"auto"
      })
      console.log(response.url)
           fs.unlinkSync(localfilepath);
           return response;
    }catch(error){
        console.log(error)
         fs.unlinkSync(localfilepath)
              return null;
    }
}

export {uploadcloudinary}