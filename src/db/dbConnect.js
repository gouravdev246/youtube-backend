const mongoose = require("mongoose");

let isConnected = false; // Track connection status

const dbConnect = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        const options = {
            dbName: "youtube-analyze",
            retryWrites: true,
            writeConcern: { w: "majority" },
        };
        

        const db = await mongoose.connect(process.env.DB_URI, options);
        isConnected = db.connections[0].readyState;
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed", error.message);
        // Don't exit process in serverless, just throw so Vercel can retry
        throw error;
    }
};

module.exports = dbConnect;