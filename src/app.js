const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const authRouter = require('../src/routers/auth.route')
const otpRouter = require('../src/routers/otp.route')
const videoRouter = require('../src/routers/dataFetch.route')
const chatRouter = require('../src/routers/chat.route')


const dbConnect = require('./db/dbConnect');

// Connect to DB immediately for serverless/Vercel
dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Update CORS for production
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use('/api/auth', authRouter)
app.use('/api/otp', otpRouter)
app.use('/api/video', videoRouter)
app.use('/api/chat', chatRouter)

app.get('/', (req, res) => {
    res.send('Hello World!');
})


module.exports = app;