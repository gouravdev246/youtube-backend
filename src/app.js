const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const authRouter = require('../src/routers/auth.route')
const otpRouter = require('../src/routers/otp.route')
const videoRouter = require('../src/routers/dataFetch.route')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors());

app.use('/api/auth', authRouter)
app.use('/api/auth', otpRouter)
app.use('/api/video' , videoRouter)

app.get('/', (req, res) => {    
    res.send('Hello World!');
})


module.exports = app;