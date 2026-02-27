require("dotenv").config();
const app = require("./src/app");
const dbConnect = require('./src/db/dbConnect')

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
}

module.exports = app;