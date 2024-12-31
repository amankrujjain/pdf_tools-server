const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const convertRoutes = require("./routes/docToPdfRoute");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use("/api/convert", convertRoutes);

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
