const express = require("express");
const multer = require("multer");
const { convertFile, downloadFile } = require("../controllers/convertDocToPdfConverter");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/convert/doc-to-pdf", upload.single("file"), convertFile);

router.get("/download/:filename", downloadFile)

module.exports = router;