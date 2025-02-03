const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');

const convertRoutes = require("./routes/docToPdfRoute");
const convertPdfToWord = require("./routes/pdfToWordRoute");

dotenv.config();

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://genztalks.in', // Your production frontend
            'http://localhost:5173', // Local development frontend
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use("/api", convertRoutes);
app.use('/api', convertPdfToWord)
app.use("/download", express.static(path.join(__dirname, 'convertedFiles')));

// Directories to clean up
const uploadDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'convertedFiles');

// Cron job to clean up old files
cron.schedule("0 * * * *", () => { // Runs every hour
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
                                console.log(`Deleted old file: ${file} from ${dir}`);
                            }
                        });
                    }
                });
            });
        });
    });
});


app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
