const express = require('express');
const router = express.Router();
const DpConfiguration = require('../models/DpConfiguration');
const shortid = require('shortid');

// GET /api/dp-configurations/public/all - Get all public DP Configurations
// IMPORTANT: Define specific routes BEFORE parameterized routes
router.get('/public/all', async (req, res) => {
    try {
        const configurations = await DpConfiguration.find({});
        res.status(200).json(configurations);
    } catch (error) {
        console.error('Error fetching DP configurations:', error);
        res.status(500).json({
            message: "Error fetching DP configurations",
            error: error.message
        });
    }
});

// GET /api/dp-configurations - Fetch all public DP Configurations (only slug and templateName)
router.get('/', async (req, res) => {
    try {
        const publicConfigurations = await DpConfiguration.find(
            { isPublic: true },
            'slug templateName mainImageCloudinaryId logoImageCloudinaryId width height xPos yPos radius');

        if (!publicConfigurations || publicConfigurations.length === 0) {
            return res.status(200).json([]); // Return empty array if none found
        }

        res.status(200).json(publicConfigurations);

    } catch (error) {
        console.error('Error fetching public DP Configurations:', error);
        res.status(500).json({ message: 'Server error while fetching public DP configurations.' });
    }
});

// POST /api/dp-configurations - Create a new DP Configuration
router.post('/', async (req, res) => {
    const {
        mainImageCloudinaryId,
        logoImageCloudinaryId,
        width,
        height,
        xPos,
        yPos,
        radius,
        templateName,
        customSlug,
        isPublic // Destructure isPublic
    } = req.body;

    try {
        // Basic validation
        if (!mainImageCloudinaryId || !logoImageCloudinaryId || !width || !height) {
            return res.status(400).json({ message: 'Missing required fields: mainImageCloudinaryId, logoImageCloudinaryId, width, height, xPos, yPos.' });
        }

        let slugToUse;
        if (customSlug) {
            // Sanitize customSlug: lowercase, replace spaces with hyphens, remove other problematic characters
            let sanitizedSlug = customSlug
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            if (!sanitizedSlug) { // If slug becomes empty after sanitization
                sanitizedSlug = shortid.generate(); // Fallback to shortid
            }

            let existingBySlug = await DpConfiguration.findOne({ slug: sanitizedSlug });
            if (existingBySlug) {
                let counter = 1;
                let newAttemptSlug;
                do {
                    newAttemptSlug = `${sanitizedSlug}-${counter}`;
                    existingBySlug = await DpConfiguration.findOne({ slug: newAttemptSlug });
                    counter++;
                } while (existingBySlug);
                slugToUse = newAttemptSlug;
            } else {
                slugToUse = sanitizedSlug;
            }
        } else {
            // Generate a unique slug using shortid
            let newSlug = shortid.generate();
            let attempts = 0;
            // Ensure slug uniqueness (highly unlikely to collide with shortid, but good practice)
            while (await DpConfiguration.findOne({ slug: newSlug }) && attempts < 5) {
                newSlug = shortid.generate();
                attempts++;
            }
            if (await DpConfiguration.findOne({ slug: newSlug })) { // Check one last time
                 return res.status(500).json({ message: 'Failed to generate a unique slug after multiple attempts.' });
            }
            slugToUse = newSlug;
        }

        // Prepare data for new configuration
        // Prepare data for new configuration
        console.log('Value of isPublic from req.body:', req.body.isPublic); // Log 1: Value from req.body

        const configData = {
            slug: slugToUse,
            mainImageCloudinaryId,
            logoImageCloudinaryId,
            width,
            height,
            xPos,
            yPos,
            radius, // Schema default applies if not in req.body or if radius is undefined
            templateName,
            // isPublic is handled below to be more explicit
        };

        // Explicitly set isPublic if provided in the request body, otherwise let schema default apply
        if (typeof isPublic === 'boolean') {
            configData.isPublic = isPublic;
        }

        console.log('Data object for DpConfiguration constructor:', configData); // Log 2: Data for constructor

        const newDpConfiguration = new DpConfiguration(configData);

        console.log('DpConfiguration object before save:', newDpConfiguration); // Log 3: Object before save

        const savedConfiguration = await newDpConfiguration.save();

        console.log('DpConfiguration object after save (savedConfiguration):', savedConfiguration); // Log 4: Object after save
        console.log('isPublic in savedConfiguration:', savedConfiguration.isPublic); // Log 5: isPublic in saved object

        res.status(201).json(savedConfiguration);

    } catch (error) {
        if (error.name === 'ValidationError') {
            // Extract validation error messages
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }
        console.error('Error creating DP Configuration:', error);
        res.status(500).json({ message: 'Server error while creating DP configuration.' });
    }
});

// GET /api/dp-configurations/:slug - Fetch a single DP Configuration by slug
// IMPORTANT: Define this AFTER any specific routes to avoid conflicts
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const configuration = await DpConfiguration.findOne({ slug });

        if (!configuration) {
            return res.status(404).json({ message: 'Configuration not found.' });
        }

        if (!configuration.isPublic) {
            // Treat non-public configurations as not found for general access
            return res.status(404).json({ message: 'Configuration not public.' });
        }

        res.status(200).json(configuration);

    } catch (error) {
        console.error(`Error fetching DP Configuration with slug ${req.params.slug}:`, error);
        res.status(500).json({ message: 'Server error while fetching DP configuration.' });
    }
});

module.exports = router;