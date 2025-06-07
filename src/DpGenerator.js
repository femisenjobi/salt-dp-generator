import React, { useState, useEffect } from "react";
import "./App.css";
import "./DpGenerator.css";

// Add isPreviewMode prop with a default value
function DpGenerator({
  width,
  height,
  xPos,
  yPos,
  mainImage,
  radius,
  logoImage,
  templateName: templateNameProp,
  isPreviewMode = false,
}) {
  const eventLogoUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/h_220/${logoImage}`; // For non-preview, the event's main logo
  const placeholderBaseImageUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080/${mainImage}`; // Base image for the DP

  // State for the final generated image URL (main DP with overlay)
  const [generatedImageUrl, setGeneratedImageUrl] = useState(
    placeholderBaseImageUrl
  );
  // State for the user's uploaded photo public_id (only in non-preview mode)
  const [uploadedUserPhotoId, setUploadedUserPhotoId] = useState("");
  // State for download link
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);
  // Removed local state for templateName

  useEffect(() => {
    // This effect constructs the URL for the preview or updates non-preview based on inputs
    let finalUrl = placeholderBaseImageUrl; // Default to placeholder
    if (isPreviewMode) {
      // For preview, mainImage IS the user's photo public_id.
      // logoImage IS the overlay logo's public_id.
      // Construct the full transformation URL.
      if (mainImage && logoImage) {
        // Ensure both are provided for a meaningful preview
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;
      } else if (mainImage) {
        // Only main image provided
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/${mainImage}`;
      }
      // If only logoImage, it's not a valid preview of a DP. Placeholder remains.
    } else {
      // For non-preview (interactive mode)
      if (uploadedUserPhotoId) {
        // If user has uploaded their photo, mainImage is the event's base image, logoImage is the event's overlay
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${uploadedUserPhotoId},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;
        // If user has uploaded their photo, we use it as the overlay
        const baseForOverlay = uploadedUserPhotoId || mainImage;
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${baseForOverlay},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;

        // Update download link
        if (uploadedUserPhotoId) {
          // Only allow download if user has uploaded their base image
          setDownloadLink(
            `https://res.cloudinary.com/dmlyic7tt/image/upload/fl_attachment:my_dp,w_1080,h_1080,c_fill/l_${uploadedUserPhotoId},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`
          );
        } else {
          setDownloadLink(""); // No download if it's just the placeholder/template base
        }
      } else {
        // No user photo uploaded yet, using mainImage prop as base for overlay
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;
        setDownloadLink(""); // No download for default template view
      }
    }
    setGeneratedImageUrl(finalUrl);
  }, [
    width,
    height,
    xPos,
    yPos,
    mainImage,
    radius,
    logoImage,
    isPreviewMode,
    uploadedUserPhotoId,
    placeholderBaseImageUrl,
  ]);

  const uploadWidget = () => {
    if (isPreviewMode) return; // Guard against calling in preview

    setLoading(true);
    window.cloudinary
      .createUploadWidget(
        { cloud_name: "dmlyic7tt", upload_preset: "ml_default" }, // Ensure these are correct
        (error, result) => {
          setLoading(false);
          if (!error && result && result.event === "success") {
            setUploadedUserPhotoId(result.info.public_id);
            // The useEffect will now reconstruct generatedImageUrl and downloadLink
          } else if (error) {
            console.error("Upload error in DpGenerator:", error);
            // Potentially reset uploadedUserPhotoId or show an error message
          }
        }
      )
      .open();
  };

  return (
    <div className={`container ${isPreviewMode ? "dp-preview-container" : "dp-generator-container"} px-md-4 px-2`}>
      {!isPreviewMode && (
        <div className="dp-header">
          <h1 className="display-4 fw-bold">Create Your Display Picture</h1>
          <p className="lead d-none d-md-block">Upload your photo and create a personalized display picture</p>
          <p className="lead d-block d-md-none">Create your personalized DP</p>
        </div>
      )}
      
      <div className="row">
        <div className={isPreviewMode ? "col-12" : "col-md-8 offset-md-2"}>
          {/* Event Logo - only in non-preview mode */}
          {!isPreviewMode && templateNameProp && (
            <div className="text-center mb-4">
              <img
                src={eventLogoUrl}
                alt="Event Logo"
                className="event-logo"
              />
              <h2 className="template-name">{templateNameProp}</h2>
            </div>
          )}

          {/* Instructions - only in non-preview mode */}
          {!isPreviewMode && (
            <div className="instructions mb-4">
              <p><i className="bi bi-info-circle me-2"></i> <span className="d-none d-md-inline">Upload your photo to create a custom display picture with this template.</span><span className="d-inline d-md-none">Upload your photo to create a custom DP.</span></p>
            </div>
          )}

          {/* Main DP display area */}
          <div className="dp-image-container">
            {loading && !isPreviewMode ? (
              <div className="loading-spinner">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <img
                src={generatedImageUrl}
                alt="Generated DP"
                className="dp-image"
              />
            )}
          </div>

          {/* Controls - only in non-preview mode */}
          {!isPreviewMode && (
            <div className="dp-controls">
              <div className="d-flex justify-content-between flex-wrap">
                <button
                  onClick={uploadWidget}
                  className="btn btn-upload mb-2 mb-md-0"
                  disabled={loading}
                >
                  <i className="bi bi-cloud-upload me-2"></i>
                  <span className="d-none d-md-inline">{uploadedUserPhotoId ? "Change Your Picture" : "Upload Your Picture"}</span>
                  <span className="d-inline d-md-none">{uploadedUserPhotoId ? "Change Photo" : "Upload Photo"}</span>
                </button>
                <a
                  href={downloadLink || "#"}
                  download="MyCustomDP.jpg"
                  className={`btn btn-download mb-2 mb-md-0 ${downloadLink ? "" : "disabled"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-download me-2"></i>
                  Download
                </a>
                <button
                  onClick={() => {
                    if (window.navigator.share) {
                      window.navigator.share({
                        title: templateNameProp || 'My Custom DP',
                        text: 'Check out my custom display picture!',
                        url: window.location.href
                      })
                      .catch(err => console.error('Error sharing:', err));
                    } else {
                      // Fallback for browsers that don't support the Web Share API
                      const tempInput = document.createElement('input');
                      document.body.appendChild(tempInput);
                      tempInput.value = window.location.href;
                      tempInput.select();
                      document.execCommand('copy');
                      document.body.removeChild(tempInput);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="btn btn-share"
                >
                  <i className="bi bi-share me-2"></i>
                  Share
                </button>
              </div>
              
              {!uploadedUserPhotoId && (
                <div className="alert alert-info mt-3" role="alert">
                  <i className="bi bi-lightbulb me-2"></i>
                  <span className="d-none d-md-inline">Upload your photo to enable the download button.</span>
                  <span className="d-inline d-md-none">Upload to enable download.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DpGenerator;
