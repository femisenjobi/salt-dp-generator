import React, { useState, useEffect } from "react";
import "./App.css";
import "./DpGenerator.css";

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
  const eventLogoUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/h_220/${logoImage}`;
  const placeholderBaseImageUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080/${mainImage}`;

  const [generatedImageUrl, setGeneratedImageUrl] = useState(placeholderBaseImageUrl);
  const [uploadedUserPhotoId, setUploadedUserPhotoId] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let finalUrl = placeholderBaseImageUrl;
    
    if (isPreviewMode) {
      if (mainImage && logoImage) {
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;
      } else if (mainImage) {
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/${mainImage}`;
      }
    } else {
      if (uploadedUserPhotoId) {
        const baseForOverlay = uploadedUserPhotoId || mainImage;
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${baseForOverlay},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;

        if (uploadedUserPhotoId) {
          setDownloadLink(
            `https://res.cloudinary.com/dmlyic7tt/image/upload/fl_attachment:my_dp,w_1080,h_1080,c_fill/l_${uploadedUserPhotoId},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`
          );
        } else {
          setDownloadLink("");
        }
      } else {
        finalUrl = `https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${logoImage},w_${width},h_${height},c_fill,x_${xPos},y_${yPos},r_${radius}/${mainImage}`;
        setDownloadLink("");
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
    if (isPreviewMode) return;

    setLoading(true);
    window.cloudinary
      .createUploadWidget(
        { cloud_name: "dmlyic7tt", upload_preset: "ml_default" },
        (error, result) => {
          setLoading(false);
          if (!error && result && result.event === "success") {
            setUploadedUserPhotoId(result.info.public_id);
          } else if (error) {
            console.error("Upload error in DpGenerator:", error);
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

          {!isPreviewMode && (
            <div className="instructions mb-4">
              <p><i className="bi bi-info-circle me-2"></i> <span className="d-none d-md-inline">Upload your photo to create a custom display picture with this template.</span><span className="d-inline d-md-none">Upload your photo to create a custom DP.</span></p>
            </div>
          )}

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