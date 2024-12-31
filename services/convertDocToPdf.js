const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const convertDocToPdf = (filePath) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "../convertedFiles"); // Target folder for converted files
    const fileName = path.basename(filePath, path.extname(filePath)) + ".pdf"; // Retain original name with .pdf extension
    const outputFilePath = path.join(outputDir, fileName);

    // Ensure convertedFiles directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const libreOfficePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;
    const command = `${libreOfficePath} --headless --convert-to pdf "${filePath}" --outdir "${outputDir}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error during conversion:", error.message);
        console.error("Command Output (stderr):", stderr);
        reject(new Error("Failed to convert the document to PDF"));
      } else {
        console.log("Command Output (stdout):", stdout);
        resolve(outputFilePath); // Return the new location of the converted file
      }
    });
  });
};
module.exports = {
  convertDocToPdf,
}