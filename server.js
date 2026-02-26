require("dotenv").config();
const app = require("./src/app");
const dbConnect = require('./src/db/dbConnect')

const PORT = process.env.PORT || 8000;

dbConnect()
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});