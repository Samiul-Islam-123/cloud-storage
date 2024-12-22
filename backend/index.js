const express = require('express');
const app = express();
const server = require('http').createServer(app);
const SocketIO = require('socket.io');
const io = SocketIO(server, {
    cors : {
        origin: "*",
        methods : ["POST", "GET"]
    }
});
const getLocalIPAddress = require('./utils/IPAddress')
const dotenv = require('dotenv')
const cors = require('cors');
const ConnectToDatabase = require('./config/Database');
const AuthRouter = require('./routes/Auth');
const AppRouter = require('./routes/App');
const path = require('path');

// Middleware to attach the socket to the request
app.use((req, res, next) => {
    req.io = io; // Attach the socket instance to the request object
    next();
});

dotenv.config();
app.use(express.json());
app.use(cors({
    origin : "*",//make sure to change this
    credentials : true
}))
app.use('/uploads', express.static(path.join(process.env.ROOT,'uploads')))

app.get('/', (req,res) => {
    res.json({
        success : true,
        message : "Hellow World, This is from server :)"
    })
})

app.use('/auth', AuthRouter);
app.use('/app', AppRouter);

io.on('connection', socket=>{
    console.log('Client connected')
})

const PORT = process.env.PORT || 5500;

server.listen(PORT,async () => {
    console.log("Server is starting...");
    await ConnectToDatabase(process.env.MONGODBURL)
    console.log(`Server is up and running on : http://${getLocalIPAddress()}:${PORT}`)
})