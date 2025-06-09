const mongoose = require('mongoose');
const shortid = require('shortid'); // For generating unique slugs

const dpConfigurationSchema = new mongoose.Schema({
    slug: {
        type: String,
        unique: true,
        required: true,
        default: shortid.generate, // Generate a unique slug by default
        index: true
    },
    mainImageCloudinaryId: {
        type: String,
        required: [true, 'Main image Cloudinary ID is required.']
    },
    logoImageCloudinaryId: {
        type: String,
        required: [true, 'Logo image Cloudinary ID is required.']
    },
    width: {
        type: Number,
        required: [true, 'Canvas width is required.'],
        min: [50, 'Width must be at least 50px.']
        // comment: "Canvas width for customization view" // Mongoose comments not directly in schema like this
    },
    height: {
        type: Number,
        required: [true, 'Canvas height is required.'],
        min: [50, 'Height must be at least 50px.']
        // comment: "Canvas height for customization view"
    },
    xPos: {
        type: Number,
        required: [true, 'Default X position for the logo is required.']
        // comment: "Default X position of logo"
    },
    yPos: {
        type: Number,
        required: [true, 'Default Y position for the logo is required.']
        // comment: "Default Y position of logo"
    },
    radius: {
        type: Number,
        optional: true, // In Mongoose, 'optional' is implied by not being 'required'
        default: 0,
        min: [0, 'Radius cannot be negative.']
        // comment: "Radius for corner rounding, e.g., of the logo"
    },
    templateName: {
        type: String,
        optional: true,
        trim: true
        // comment: "User-friendly name for this DP template"
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // Add timestamps (createdAt, updatedAt)

// Adding comments directly in schema is not a Mongoose feature.
// They are best kept in documentation or code comments like this.

// Pre-save hook to ensure slug is generated if not provided (redundant if default is set, but good practice)
dpConfigurationSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = shortid.generate();
    }
    next();
});

const DpConfiguration = mongoose.model('DpConfiguration', dpConfigurationSchema);

module.exports = DpConfiguration;
