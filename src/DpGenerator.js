import React, { useState, useEffect } from "react"; // Added useEffect

import "./App.css";

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
    // Adjust container and column classes based on isPreviewMode
    <div
      className={`container ${isPreviewMode ? "dp-preview-container p-0" : ""}`}
    >
      <div className="row">
        <div
          className={
            isPreviewMode
              ? "col-12"
              : "col-md-8 col-lg-6 offset-md-2 offset-lg-3"
          }
        >
          {/* Event Logo - only in non-preview mode (assuming it's specific to the event page) */}
          {!isPreviewMode && (
            <div className="row d-flex justify-content-center">
              <img
                src={eventLogoUrl}
                alt="Event Logo"
                className="img-responsive"
                style={{ height: "120px", marginBottom: "10px" }}
              />
            </div>
          )}

          {/* Main DP display area */}
          <div className="row d-flex justify-content-center mb-3">
            {loading && !isPreviewMode ? (
              <div
                className="spinner-border"
                role="status"
                style={{ height: "200px", width: "200px", margin: "100px" }}
              >
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <img
                src={generatedImageUrl}
                alt="Generated DP"
                className="img-responsive"
                style={{
                  height: isPreviewMode ? "auto" : "400px",
                  maxWidth: "100%",
                  border: "1px solid #eee",
                }}
              />
            )}
          </div>

          {/* Controls - only in non-preview mode */}
          {!isPreviewMode && (
            <>
              {/* Display templateNameProp if available */}
              {templateNameProp && (
                <div className="row d-flex justify-content-center mb-2">
                  <h4>Template: {templateNameProp}</h4>
                </div>
              )}
              {/* Removed template name input field */}
              <div className="row d-flex justify-content-center">
                <h3>Create your custom DP</h3>
              </div>
              <div className="row d-flex justify-content-center">
                <div className="main">
                  <div className="upload d-flex justify-content-around">
                    <button
                      onClick={uploadWidget}
                      className="upload-button btn btn-primary"
                    >
                      {uploadedUserPhotoId
                        ? "Change Your Picture"
                        : "Upload Your Picture"}
                    </button>
                    <a
                      href={downloadLink || "#"}
                      download="MyCustomDP.jpg"
                      className={`btn btn-primary ${
                        downloadLink ? "" : "disabled"
                      } ml-3`}
                      target="_blank"
                      rel="noopener noreferrer"
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
  );
}

export default DpGenerator;
