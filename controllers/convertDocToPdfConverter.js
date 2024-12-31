const { convertDocToPdf } = require('../services/convertDocToPdf');
const path = require("path");
const fs = require("fs"); 

const convertFile = async (req, res) => {
    try {
        const uploadedFilePath = path.join(__dirname, "../uploads", req.file.filename);
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

       
        if (!['.doc', '.docx'].includes(fileExtension)) {
           
            fs.unlinkSync(uploadedFilePath);
            return res.status(400).json({
                success: false,
                message: "Invalid file format. Only .doc and .docx files are accepted."
            });
        }

       
        const filePath = path.join(__dirname, "../uploads", req.file.originalname);
        
      
        fs.renameSync(uploadedFilePath, filePath);

       
        const convertedFile = await convertDocToPdf(filePath);

        res.status(200).json({
            success: true,
            message: "DOC/DOCX file converted to PDF successfully.",
            data: {
                originalFile: req.file.originalname,
                convertedFile: path.basename(convertedFile),
                convertedFilePath: convertedFile
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    convertFile
};
