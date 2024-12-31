const express = require("express");
const multer = require("multer");
const { convertFile } = require("../controllers/convertDocToPdfConverter");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/doc-to-pdf", upload.single("file"), convertFile);

module.exports = router;