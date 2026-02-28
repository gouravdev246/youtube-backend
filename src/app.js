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
    "https://youtube-frontend-beige.vercel.app",
    "https://youtube-frontend-woad.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use('/api/auth', authRouter)
app.use('/api/otp', otpRouter)
app.use('/api/video', videoRouter)
app.use('/api/chat', chatRouter)

app.get('/', (req, res) => {
    res.send('Hello World!');
})


module.exports = app;