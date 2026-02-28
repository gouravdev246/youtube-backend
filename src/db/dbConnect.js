const mongoose = require("mongoose");

/**
 * Global is used here to maintain a cached connection across hot-starts
 * in Vercel's serverless environment.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async () => {
    if (cached.conn) {
        console.log("Using existing database connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const options = {
            dbName: "youtube-analyze",
            bufferCommands: false, // Stop buffering to catch errors faster
            serverSelectionTimeoutMS: 5000, // Fail fast if no server is found
            socketTimeoutMS: 45000,
            family: 4 // Use IPv4 for stability in some cloud providers
        };

        console.log("Creating new database connection...");
        cached.promise = mongoose.connect(process.env.DB_URI, options).then((mongoose) => {
            console.log("Database connected successfully");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null; // Clear promise on error so we can retry on next request
        console.error("Database connection failed", e.message);
        throw e;
    }

    return cached.conn;
};

module.exports = dbConnect;