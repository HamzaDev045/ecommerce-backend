import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connect } from './config/index.js'; // database connectivity
import routes from './routes/index.js'
import { apiError, apiErrorHandler } from './utils/index.js'
import { compressionMiddleware } from './middleware/index.js';
import cloudinary from "cloudinary";

dotenv.config("./.env");

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
const port = process.env.PORT || 4000;

dotenv.config();
app.use(express.json());
app.use(express.json({ limit: "10mb" })); //Parse Body Means parse Reqeust Like Post/delete/put Request
app.use(compressionMiddleware())
app.use(cors());
routes(app)

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A warehouse client connected');

  socket.on('disconnect', () => {
    console.log('A warehouse client disconnected');
  });
});

// Make io accessible throughout the application
app.set('io', io);

app.use(({ next }) => next(new apiError(404, 'Not found', 'server')))
app.use(apiErrorHandler)

async function connectServer() {    try {
        connect();
        httpServer.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } catch (err) {
        console.error('Error starting server:', err?.message);
    }
}

connectServer();
