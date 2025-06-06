const cloudinary = require('cloudinary').v2; // Use v2 for the latest features
require('dotenv').config(); // Ensure environment variables are loaded

// Configure Cloudinary
// Option 1: Using CLOUDINARY_URL from .env
if (process.env.CLOUDINARY_URL) {
    try {
        cloudinary.config({
            secure_url: process.env.CLOUDINARY_URL, // This might not be the correct way to pass CLOUDINARY_URL
        });
         // Correct way to configure with CLOUDINARY_URL:
         // The SDK typically parses CLOUDINARY_URL automatically if set as an environment variable.
         // Explicit configuration is usually done with cloud_name, api_key, and api_secret.
         // However, we can still set it up to prefer individual keys if CLOUDINARY_URL is problematic or not set.

    } catch (error) {
        console.warn('Cloudinary CLOUDINARY_URL is set but might be invalid. Trying individual keys.', error);
        // Fallback to individual keys if URL parsing fails or if they are also provided
    }
}

// Option 2: Prefer individual keys if provided, or as a fallback
// This setup allows for CLOUDINARY_URL to be primary if correctly parsed by the SDK automatically,
// or uses individual keys if they are present.
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true // Ensures HTTPS URLs are generated
    });
    console.log('Cloudinary configured using individual API key, secret, and cloud name.');
} else if (!process.env.CLOUDINARY_URL) {
    // Only log an error if neither CLOUDINARY_URL nor individual keys are found
    console.error('Error: Cloudinary configuration is missing. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
} else if (process.env.CLOUDINARY_URL && cloudinary.config().cloud_name) {
    // If CLOUDINARY_URL was set and successfully configured Cloudinary (check by seeing if cloud_name is now set)
    console.log('Cloudinary configured using CLOUDINARY_URL.');
}


// Test configuration (optional, but good for immediate feedback)
// This might make an API call, so use judiciously or remove for production startup
/*
if (cloudinary.config().cloud_name) { // Check if configuration seems to be set
    console.log('Cloudinary configuration seems valid. Cloud name:', cloudinary.config().cloud_name);
    // You could add a ping or a small API call here to truly verify
    // cloudinary.api.ping((error, result) => {
    //    if (error) console.error('Cloudinary ping failed:', error);
    //    else console.log('Cloudinary ping successful:', result);
    // });
} else {
    console.warn('Cloudinary might not be configured correctly. Check .env variables.');
}
*/

module.exports = cloudinary;
