import express from 'express';
import userRouter from './routes/userRouter.js';
import chatRouter from './routes/chatRouter.js';
import dotenv from 'dotenv';
import db from './db/db.js';
import tweetRouter from './routes/tweetRouter.js';
import messageRouter from './routes/messageRouter.js';
// import http from 'http';
// import { Server } from 'socket.io';

dotenv.config();

const app = express();

// Express settings
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
    next();
  });
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Connect with db
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

// const httpServer = http.createServer(app);
// const io = new Server(httpServer);

// Connection
// io.on('connection', (socket) => {
//     console.log("User connected");
//     socket.on('disconnect', () => {
//         console.log("User disconnected");
//     });
// });

// IO Middleware (so each req has a .io to emit to)
// app.use((req, res, next) => {
//     req.io = io;
//     next();
// })

// Routes
app.use('/api/user', userRouter);
app.use('/api/tweet', tweetRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// Default
app.get('/', (req, res) => {
    res.status(200).send("Server is ready");
})

// Error Default Middleware
app.use((err, res, req, next) => {
    res.status(500).send({message: err.message});
})

const apiPort = process.env.PORT || 5000;
var server = app.listen(apiPort, () => {
    console.log(`Server is ready at https://localhost:${apiPort}`);
})