import React, { useState, useEffect } from 'react'; // Added useEffect

import './App.css';

// Add isPreviewMode prop with a default value
function DpGenerator({ width, height, xPos, yPos, mainImage, radius, logoImage, isPreviewMode = false }) {
  const eventLogoUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/h_220/${logoImage}`; // For non-preview, the event's main logo
  const placeholderBaseImageUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080/${mainImage}`; // Base image for the DP

  // State for the final generated image URL (main DP with overlay)
  const [generatedImageUrl, setGeneratedImageUrl] = useState(placeholderBaseImageUrl);
  // State for the user's uploaded photo public_id (only in non-preview mode)
  const [uploadedUserPhotoId, setUploadedUserPhotoId] = useState('');
  // State for download link
  const [downloadLink, setDownloadLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This effect constructs the URL for the preview or updates non-preview based on inputs
    let finalUrl = placeholderBaseImageUrl; // Default to placeholder
    if (isPreviewMode) {
      // For preview, mainImage IS the user's photo public_id.
      // logoImage IS the overlay logo's public_id.
      // Construct the full transformation URL.
      if (mainImage && logoImage) { // Ensure both are provided for a meaningful preview
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;
      } else if (mainImage) { // Only main image provided
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/${mainImage}`;
      }
      // If only logoImage, it's not a valid preview of a DP. Placeholder remains.
    } else {
      // For non-preview (interactive mode)
      if (uploadedUserPhotoId) {
        // If user has uploaded their photo, mainImage is the event's base image, logoImage is the event's overlay
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/l_${uploadedUserPhotoId},c_fill,w_1080,h_1080/${mainImage}`;
        // The above line seems overly complex. The standard is usually:
        // Base image is `mainImage`. User uploads `uploadedUserPhotoId`. Logo is `logoImage`.
        // The structure from original `uploadWidget` was:
        // `https://.../l_${result.info.public_id},w_${width},h_${height}...,r_${radius}/${mainImage}`
        // Here, result.info.public_id was the user's photo, and mainImage was the base template image.
        // And logoImage was the one at the top, not part of this transformation.
        // Let's stick to the original transformation logic for overlaying on a base image.
        // The `logoImage` prop is the one applied as an overlay. `mainImage` is the base.
        // `uploadedUserPhotoId` is the photo that gets composed ONTO the `mainImage`.
        // This interpretation might be wrong. Let's assume the original structure:
        // User uploads *their* photo. This photo is then overlaid with `logoImage`.
        // The `mainImage` prop is the *base background* for the event.
        // So, `l_USER_PHOTO_ID,.../l_LOGO_ID,.../BASE_EVENT_IMAGE`
        // Or, more likely: `l_LOGO_ID,w_LOGO_WIDTH,... / USER_UPLOADED_PHOTO_ID` (if mainImage is not used when user uploads own)
        // Or: `l_LOGO_ID,w_LOGO_WIDTH,... / BASE_IMAGE_FOR_EVENT` (if user only customizes placement of logo on predefined event base)

        // Re-evaluating: In DpGenerator, `mainImage` is the big placeholder. `logoImage` is the small one at top.
        // User uploads *their* picture, and this picture gets the `logoImage` (from props) overlaid.
        // So, the `mainImage` prop is actually the one being *replaced* by user's upload.
        // And `logoImage` is the overlay.
        // `setImage(`https://.../l_${result.info.public_id},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`);`
        // This means: `l_LOGO_PROP_ID, ... / USER_UPLOADED_PHOTO_ID` --> This is wrong.
        // It should be: `l_LOGO_PROP_ID, ... / MAIN_IMAGE_PROP` (if user doesn't upload)
        // OR `l_LOGO_PROP_ID, ... / USER_UPLOADED_PHOTO_ID` (if user uploads)

        // Let's simplify: `generatedImageUrl` is the image shown in the large preview spot.
        // If user uploads their photo (`uploadedUserPhotoId`), that becomes the base for the overlay.
        // If not, `mainImage` (prop) is the base.
        // `logoImage` (prop) is always the overlay.
        const baseForOverlay = uploadedUserPhotoId || mainImage;
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${baseForOverlay}`;

        // Update download link
        if (uploadedUserPhotoId) { // Only allow download if user has uploaded their base image
             setDownloadLink(`https://res.cloudinary.com/dmlyic7tt/image/upload/fl_attachment:my_dp,w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${uploadedUserPhotoId}`);
        } else {
            setDownloadLink(''); // No download if it's just the placeholder/template base
        }
      } else {
        // No user photo uploaded yet, using mainImage prop as base for overlay
         finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;
         setDownloadLink(''); // No download for default template view
      }
    }
    setGeneratedImageUrl(finalUrl);

  }, [width, height, xPos, yPos, mainImage, radius, logoImage, isPreviewMode, uploadedUserPhotoId, placeholderBaseImageUrl]);


  const uploadWidget = () => {
    if (isPreviewMode) return; // Guard against calling in preview

    setLoading(true);
    window.cloudinary.createUploadWidget(
      { cloud_name: 'dmlyic7tt', upload_preset: 'ml_default'}, // Ensure these are correct
      (error, result) => {
        setLoading(false);
        if (!error && result && result.event === "success") {
          setUploadedUserPhotoId(result.info.public_id);
          // The useEffect will now reconstruct generatedImageUrl and downloadLink
        } else if (error) {
          console.error("Upload error in DpGenerator:", error);
          // Potentially reset uploadedUserPhotoId or show an error message
        }
      },
    ).open();
  };

  return (
    // Adjust container and column classes based on isPreviewMode
    <div className={`container ${isPreviewMode ? 'dp-preview-container p-0' : ''}`}>
      <div className="row">
        <div className={isPreviewMode ? 'col-12' : 'col-md-8 col-lg-6 offset-md-2 offset-lg-3'}>
          {/* Event Logo - only in non-preview mode (assuming it's specific to the event page) */}
          {!isPreviewMode && (
            <div className="row d-flex justify-content-center">
              <img src={eventLogoUrl} alt="Event Logo" className="img-responsive" style={{height: '120px', marginBottom:'10px'}} />
            </div>
          )}

          {/* Main DP display area */}
          <div className="row d-flex justify-content-center mb-3">
            {loading && !isPreviewMode ? (
              <div className="spinner-border" role="status" style={{height: '200px', width: '200px', margin: '100px'}}>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <img
                src={generatedImageUrl}
                alt="Generated DP"
                className="img-responsive"
                style={{
                  height: isPreviewMode ? 'auto' : '400px',
                  maxWidth: '100%',
                  border: '1px solid #eee'
                }}
              />
            )}
          </div>

          {/* Controls - only in non-preview mode */}
          {!isPreviewMode && (
            <>
              <div className="row d-flex justify-content-center">
                <h3>Create your custom DP</h3>
              </div>
              <div className="row d-flex justify-content-center">
                <div className="main">
                  <div className="upload d-flex justify-content-around">
                    <button onClick={uploadWidget} className="upload-button btn btn-primary">
                      {uploadedUserPhotoId ? 'Change Your Picture' : 'Upload Your Picture'}
                    </button>
                    <a
                      href={downloadLink || '#'}
                      download="MyCustomDP.jpg"
                      className={`btn btn-primary ${downloadLink ? '' : 'disabled'} ml-3`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DpGenerator;
