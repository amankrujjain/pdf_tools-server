const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const convertRoutes = require("./routes/docToPdfRoute");

dotenv.config();

const app = express();
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials: true
}))

app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use("/api", convertRoutes);
app.use("/download", express.static(path.join(__dirname, 'convertedFiles')));

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
