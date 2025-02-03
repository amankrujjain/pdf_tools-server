const express = require('express');
const multer = require("multer");

const {convertFile, downloadFile} = require("../controllers/pdfToWordController");

const router = express.Router();
const upload = multer({dest: "uploads/pdfToWord" });

router.post("/convert/pdfToWord", upload.single('file'), convertFile);
router.get("/download/pdf-to-word/:filename", downloadFile);

module.exports = router;