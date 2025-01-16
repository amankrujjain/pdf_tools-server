const { convertDocToPdf } = require('../services/convertDocToPdf');
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

const uploadDir = path.join(__dirname, "../uploads");
const convertedDir = path.join(__dirname, "../convertedFiles");

// Function to convert uploaded file
const convertFile = async (req, res) => {
    try {
        const uniqueId = uuidv4(); // Generate unique ID
        const uploadedFilePath = path.join(uploadDir, `${uniqueId}${path.extname(req.file.originalname)}`);
        
        // Move uploaded file to the unique file path
        fs.renameSync(req.file.path, uploadedFilePath);

        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        // Validate file type
        if (!['.doc', '.docx'].includes(fileExtension)) {
            fs.unlinkSync(uploadedFilePath); // Delete invalid file
            return res.status(400).json({
                success: false,
                message: "Invalid file format. Only .doc and .docx files are accepted."
            });
        }

        // Convert the file
        const convertedFilePath = path.join(convertedDir, `${uniqueId}.pdf`);
        await convertDocToPdf(uploadedFilePath, convertedFilePath);

        // Respond with success
        res.status(200).json({
            success: true,
            message: "File converted successfully.",
            data: {
                originalFile: req.file.originalname,
                convertedFile: `${uniqueId}.pdf`,
                downloadPath: `/download/${uniqueId}.pdf`
            }
        });

        // Cleanup uploaded file after conversion
        fs.unlink(uploadedFilePath, (err) => {
            if (err) console.error(`Error deleting uploaded file: ${err.message}`);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Function to handle file download
const downloadFile = (req, res) => {
    try {
        const fileName = req.params.filename;
        const filePath = path.join(convertedDir, fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File not found."
            });
        }

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("Error while downloading the file:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error downloading the file."
                });
            }

            // Delete file after successful download
            fs.unlink(filePath, (deleteErr) => {
                if (deleteErr) {
                    console.error("Error deleting the file:", deleteErr);
                } else {
                    console.log(`File ${fileName} deleted successfully.`);
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cron job to clean up old files
cron.schedule('0 * * * *', () => { // Runs every hour
    [uploadDir, convertedDir].forEach((dir) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                console.error(`Error reading directory ${dir}:`, err);
                return;
            }

            files.forEach((file) => {
                const filePath = path.join(dir, file);
                fs.stat(filePath, (statErr, stats) => {
                    if (statErr) {
                        console.error(`Error stating file ${file}:`, statErr);
                        return;
                    }

                    const now = Date.now();
                    const fileAge = now - stats.mtimeMs; // File age in milliseconds
                    const maxAge = 1 * 60 * 60 * 1000; // 1 hour

                    if (fileAge > maxAge) {
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) {
                                console.error(`Error deleting file ${file}:`, unlinkErr);
                            } else {
                                console.log(`Deleted old file: ${file}`);
                            }
                        });
                    }
                });
            });
        });
    });
});

module.exports = {
    convertFile,
    downloadFile
};
