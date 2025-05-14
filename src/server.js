import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
// import routes from './routes';
import { connect } from './config/index.js'; // database connectivity
import routes from './routes/index.js'
import { apiError, apiErrorHandler } from './utils/index.js'
import { compressionMiddleware } from './middleware/index.js';

const app = express();
const port = process.env.PORT || 4000;

dotenv.config();
app.use(express.json());
app.use(compressionMiddleware())
app.use(cors());
routes(app)

app.use(({ next }) => next(new apiError(404, 'Not found', 'server')))
app.use(apiErrorHandler)

async function connectServer() {
    try {
        connect();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } catch (err) {
        console.error('Error starting server:', err?.message);
    }
}

connectServer();
