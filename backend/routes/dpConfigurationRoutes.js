const express = require('express');
const router = express.Router();
const DpConfiguration = require('../models/DpConfiguration');
const shortid = require('shortid');

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
        customSlug
    } = req.body;

    try {
        // Basic validation
        if (!mainImageCloudinaryId || !logoImageCloudinaryId || !width || !height || !xPos || !yPos) {
            return res.status(400).json({ message: 'Missing required fields: mainImageCloudinaryId, logoImageCloudinaryId, width, height, xPos, yPos.' });
        }

        let slugToUse = customSlug;
        if (customSlug) {
            // Check if custom slug already exists
            const existingBySlug = await DpConfiguration.findOne({ slug: customSlug });
            if (existingBySlug) {
                return res.status(400).json({ message: 'This custom slug is already in use. Please choose another.' });
            }
        } else {
            // Generate a unique slug
            let newSlug = shortid.generate();
            let attempts = 0;
            // Ensure slug uniqueness (highly unlikely to collide with shortid, but good practice)
            while (await DpConfiguration.findOne({ slug: newSlug }) && attempts < 5) {
                newSlug = shortid.generate();
                attempts++;
            }
            if (await DpConfiguration.findOne({ slug: newSlug })) {
                 return res.status(500).json({ message: 'Failed to generate a unique slug after multiple attempts.' });
            }
            slugToUse = newSlug;
        }

        const newDpConfiguration = new DpConfiguration({
            slug: slugToUse,
            mainImageCloudinaryId,
            logoImageCloudinaryId,
            width,
            height,
            xPos,
            yPos,
            radius, // Will use default from schema if not provided
            templateName
        });

        const savedConfiguration = await newDpConfiguration.save();
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

module.exports = router;
