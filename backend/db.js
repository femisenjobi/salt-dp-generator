const mongoose = require('mongoose');
require('dotenv').config(); // Ensure environment variables are loaded

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in your .env file.');
    process.exit(1); // Exit the process if MongoDB URI is not set
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true, // Deprecated, but good to include for older Mongoose versions if necessary
            useUnifiedTopology: true, // Deprecated, but good to include for older Mongoose versions if necessary
            // Mongoose 6+ no longer needs these options, they are default
        });
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
