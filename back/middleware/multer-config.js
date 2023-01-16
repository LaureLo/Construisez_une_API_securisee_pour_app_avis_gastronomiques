const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;

// Configuring data storage disk on server with multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, "../images"),
    filename: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        const fileName = "image_" + uuid().replace(/-/g, "") + ext;         

        callback(null, fileName);
    }
});

// Configuring mult middleware
const multerFilter = multer({
    storage: storage,
    // Limitation of uploaded file size
    limits: { fileSize: 3000000 }, 
    // Allowed file type filtering
    fileFilter: function (req, file, cb) {
       const fileTypes = /tif|pjp|xbm|jxl|svgz|jpg|jpeg|ico|tiff|gif|svg|jfif|webp|png|bmp|pjpg|avif/;
       const extName = fileTypes.test(path.extname(file.originalname));

       file.originalname.toLowerCase();

       const mimeType = fileTypes.test(file.mimetype);

       if (extName && mimeType) {
            cb(null, true);
       } else {
            cb({message: "Image format not allowed!"});
       }
     }
 }).single('image');

module.exports = multerFilter;