import mongoose from 'mongoose';

async function connect() {
    try {
        let url;
        if (process.env.NODE_ENV === 'production') {
            url = process.env.mongoConnectivityString;
        } else {
            // url = `mongodb://localhost:27017/synthflow_dev2`;
            url = process.env.mongoConnectivityString;
        }

        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit the process if unable to connect to MongoDB
    }
}

export default connect
