const path = require("path");
const fs = require("fs");
const { convertPdfToWord } = require("../services/pdfToWordService");

// Define directories
const baseUploadDir = path.join(__dirname, "../uploads/pdfToWord");
const baseConvertedDir = path.join(__dirname, "../convertedFiles/pdfToWord");

const convertFile = async (req, res) => {
  try {
    const originalFileName = req.file.originalname;
    const fileExtension = path.extname(originalFileName).toLowerCase();

    // Validate file type (only PDF is allowed)
    if (fileExtension !== ".pdf") {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only PDF files are accepted!",
      });
    }

    // Ensure directories exist
    if (!fs.existsSync(baseUploadDir)) {
      fs.mkdirSync(baseUploadDir, { recursive: true });
    }
    if (!fs.existsSync(baseConvertedDir)) {
      fs.mkdirSync(baseConvertedDir, { recursive: true });
    }

    // File paths
    const uploadedFilePath = path.join(baseUploadDir, originalFileName);
    const baseName = path.basename(originalFileName, fileExtension);
    const convertedFilePath = path.join(baseConvertedDir, `${baseName}.docx`);

    // Move the uploaded file
    fs.renameSync(req.file.path, uploadedFilePath);

    // Convert PDF to Word
    await convertPdfToWord(uploadedFilePath, convertedFilePath);

    // Respond with success and file details
    res.status(200).json({
      success: true,
      message: "File converted successfully.",
      data: {
        originalFile: originalFileName,
        convertedFile: `${baseName}.docx`,
        downloadPath: `/download/${baseName}.docx`,
      },
    });

  } catch (error) {
    console.error("Error during file conversion:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const downloadFile = async (req, res) => {
  console.log("I am inside and lets download")
  try {
    let { filename } = req.params;
    let filePath = path.join(baseConvertedDir, filename);

    console.log("🔍 Looking for file:", filePath);
    console.log("📁 Available Files:", fs.readdirSync(baseConvertedDir));

    // Handle spaces and underscores in filenames
    if (!fs.existsSync(filePath)) {
      // Try alternative name formats (replace underscores with spaces)
      let alternativeFilename = filename.replace(/_/g, " ");
      filePath = path.join(baseConvertedDir, alternativeFilename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "File not found!",
        });
      }
    }

    // Download the file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error sending file:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error downloading the file",
        });
      }
    });

  } catch (error) {
    console.error("Error in download route:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  convertFile,
  downloadFile
};
