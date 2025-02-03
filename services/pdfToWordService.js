const path = require("path");
const fs = require("fs-extra");
const Tesseract = require("tesseract.js");
const pdf = require("pdf-poppler");
const { Document, Packer, Paragraph } = require("docx");
const { PDFDocument } = require("pdf-lib");

const getLatestImageFile = (outputDir, pageNumber) => {
  const files = fs.readdirSync(outputDir);
  const pageFiles = files.filter(file =>
    file.includes(`page-${pageNumber}`) && file.endsWith(".png")
  );

  if (pageFiles.length === 0) {
    console.error(`❌ Error: No image found for page ${pageNumber}`);
    return null;
  }

  return path.join(outputDir, pageFiles[0]);
};

const convertPdfToWord = async (filePath, outputFilePath) => {
  try {
    console.log("Processing PDF for OCR:", filePath);

    const outputDir = path.join(path.dirname(filePath), "pdf_images");
    await fs.ensureDir(outputDir);

    const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));
    const numPages = pdfDoc.getPageCount();
    console.log(`Total Pages in PDF: ${numPages}`);

    let extractedText = "";
    let paragraphs = [];

    for (let i = 1; i <= numPages; i++) {
      console.log(`Converting Page ${i} to Image...`);

      const opts = {
        format: "png",
        out_dir: outputDir,
        out_prefix: `page-${i}`,
        page: i,
      };

      await pdf.convert(filePath, opts);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const imagePath = getLatestImageFile(outputDir, i);
      if (!imagePath) {
        console.error(`❌ Skipping OCR for Page ${i}, image not found`);
        continue;
      }

      console.log(`Extracting text from: ${imagePath}`);

      const ocrResult = await Tesseract.recognize(imagePath, "eng");
      const text = ocrResult?.data?.text?.trim();

      if (!text || text.length === 0) {
        console.warn(`⚠ Warning: No text extracted from Page ${i}`);
        paragraphs.push(new Paragraph(`[Page ${i}]: No text found`));
      } else {
        paragraphs.push(new Paragraph(`[Page ${i}]`));
        text.split("\n").forEach(line => {
          paragraphs.push(new Paragraph(line));
        });
      }

      console.log(`✅ Extracted Text from Page ${i}`);
    }

    // Ensure there is some text to write into DOCX
    if (paragraphs.length === 0) {
      throw new Error("No text extracted from the entire PDF");
    }

    console.log("📄 Generating Word Document...");

    const doc = new Document({
      creator: "OCR Tool", // ✅ FIX: Ensures metadata is present
      title: "Extracted OCR Text",
      description: "Generated from PDF using Tesseract.js",
      sections: [{ children: paragraphs }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputFilePath, buffer);
    console.log("✅ OCR & Word Conversion Successful:", outputFilePath);

    return outputFilePath;
  } catch (error) {
    console.error("🚨 Error during OCR processing:", error.message);
    throw new Error("Failed to extract text from PDF");
  }
};

module.exports = { convertPdfToWord };
