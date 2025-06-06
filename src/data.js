// src/data.js
const data = {
  'tech-conference-2024': {
    name: 'Tech Conference 2024',
    description: 'Show your participation in the annual Tech Conference. Frame by TechCorp.',
    width: 600,
    height: 600,
    xPos: 0,
    yPos: 0,
    mainImage: 'tech_conference_main_template.png', // Replace with actual Cloudinary public ID
    radius: 0, // Square frame
    logoImage: 'techcorp_logo.png' // Replace with actual Cloudinary public ID
  },
  'charity-run-hearts': {
    name: 'Charity Run Hearts',
    description: 'Support the cause with this lovely heart-themed frame for the annual charity run.',
    width: 450,
    height: 450,
    xPos: 50,
    yPos: 50,
    mainImage: 'charity_run_heart_frame.png', // Replace with actual Cloudinary public ID
    radius: 225, // Circular cutout for profile picture
    logoImage: 'charity_event_logo.png' // Replace with actual Cloudinary public ID
  },
  'gamers-unite-badge': {
    name: 'Gamers Unite Badge',
    description: 'Level up your profile picture with this exclusive Gamers Unite badge.',
    width: 300,
    height: 300,
    xPos: 10,
    yPos: 700, // Assuming a 1080x1080 image, this places the badge at the bottom
    mainImage: 'gamers_unite_main_bg.png', // This could be a transparent overlay or a full frame
    radius: 20, // Slightly rounded corners for the badge if it's an overlay
    logoImage: 'gamers_unite_icon.png' // Replace with actual Cloudinary public ID for the badge graphic
  },
  'book-lovers-corner': {
    name: 'Book Lovers Corner',
    description: 'A cozy corner frame for all the avid readers out there. Share your love for books!',
    width: 700,
    height: 300, // A banner-style frame part
    xPos: 0,
    yPos: 780, // Positioned at the bottom
    mainImage: 'book_lovers_banner_frame.png', // Replace with actual Cloudinary public ID
    radius: 0,
    logoImage: 'library_logo_subtle.png' // Replace with actual Cloudinary public ID
  },
  'spring-fest-floral': {
    name: 'Spring Fest Floral',
    description: 'Celebrate the season with this beautiful floral frame for Spring Fest.',
    width: 550,
    height: 550,
    xPos: -25, // Example of slight offset
    yPos: 25,
    mainImage: 'spring_floral_template.png', // Replace with actual Cloudinary public ID
    radius: 75, // Rounded profile picture area
    logoImage: 'spring_fest_logo.png' // Replace with actual Cloudinary public ID
  }
};

export default data;
