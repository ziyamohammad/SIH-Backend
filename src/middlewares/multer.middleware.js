import multer from "multer"
import fs from "fs";
import path from "path";

const uploadPath = path.join(process.cwd(), "public", "temp");

// Create the folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }

})
 export const upload = multer({
    storage
 })