const path = require("path");

module.exports = {
    PORT: process.env.PORT || 4000,
    DATA_DIR: path.join(__dirname, "../../data"),
    UPLOADS_DIR: path.join(__dirname, "../../data/uploads"),
    DATA_FILE: path.join(__dirname, "../../data/db.json"),
};
