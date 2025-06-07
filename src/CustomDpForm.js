import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DpGenerator from './DpGenerator'; // Import DpGenerator

const CustomDpForm = () => {
  // Initial state values are mostly numbers or string representations of numbers
  const [width, setWidth] = useState('300');
  const [height, setHeight] = useState('300');
  const [xPos, setXPos] = useState('0');
  const [yPos, setYPos] = useState('0');
  const [radius, setRadius] = useState('0'); // DpGenerator might expect string for 'max' or numbers
  const [templateName, setTemplateName] = useState(''); // New state for template name
  const [slug, setSlug] = useState(''); // New state for slug
  const [slugError, setSlugError] = useState(''); // New state for slug validation error
  const [isPublic, setIsPublic] = useState(true); // New state for isPublic, default true
  const [logoImagePublicId, setLogoImagePublicId] = useState(''); // New state for logo image public ID
  const [mainImagePublicId, setMainImagePublicId] = useState(''); // For the user's uploaded photo
  const [uploading, setUploading] = useState(false); // Combined uploading state for both images

  const navigate = useNavigate();

  const handleTemplateNameChange = (e) => {
    const value = e.target.value;
    setTemplateName(value);
    
    // Auto-populate slug from template name
    if (value) {
      const sanitizedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setSlug(sanitizedSlug);
      
      // Validate the generated slug
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (sanitizedSlug === "" || slugRegex.test(sanitizedSlug)) {
        setSlugError('');
      } else {
        setSlugError('Slug can only contain lowercase letters, numbers, and single hyphens. Cannot start/end with hyphen or have multiple hyphens.');
      }
    }
  };

  const handleSlugChange = (event) => {
    const { value } = event.target;
    // Sanitize: lowercase and replace spaces with hyphens
    const sanitizedValue = value.toLowerCase().replace(/\s+/g, '-');

    // Validate: only lowercase letters, numbers, and hyphens. Cannot start or end with hyphen. Cannot have multiple hyphens in a row.
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (sanitizedValue === "" || slugRegex.test(sanitizedValue)) {
      setSlugError('');
    } else {
      setSlugError('Slug can only contain lowercase letters, numbers, and single hyphens. Cannot start/end with hyphen or have multiple hyphens.');
    }
    // Always update the slug state with the sanitized value for immediate feedback
    setSlug(sanitizedValue);
  };

  // Function to upload logo image via Cloudinary widget
  const uploadLogoImageViaWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary widget is not loaded. Please check your internet connection or try refreshing.');
      return;
    }
    setUploading(true); // Use the same uploading state for simplicity, or create a new one e.g. setLogoUploading(true)
    const logoWidget = window.cloudinary.createUploadWidget(
      {
        cloud_name: 'dmlyic7tt', // Replace with your Cloudinary cloud name
        upload_preset: 'ml_default', // Replace with your Cloudinary upload preset
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true, // Optional: enable cropping for logo
        cropping_aspect_ratio: 1, // Optional: enforce square logo
        show_powered_by: false,
      },
      (error, result) => {
        setUploading(false);
        if (!error && result && result.event === "success") {
          setLogoImagePublicId(result.info.public_id);
          // Optionally, clear any local file state if you were using one for the logo
        } else if (error) {
          console.error('Logo upload error:', error);
          alert('Logo image upload failed. Please try again.');
        }
      }
    );
    logoWidget.open();
  };

  // Using the widget for upload as it provides more features like cropping
  const uploadSampleImageViaWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary widget is not loaded. Please check your internet connection or try refreshing.');
      return;
    }
    setUploading(true);
    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloud_name: 'dmlyic7tt', // Ensure this is your cloud name
        upload_preset: 'ml_default', // Ensure this is your upload preset
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true,
        cropping_aspect_ratio: 1,
        show_powered_by: false,
      },
      (error, result) => {
        setUploading(false);
        if (!error && result && result.event === "success") {
          setMainImagePublicId(result.info.public_id);
        } else if (error) {
          console.error('Upload error:', error);
          alert('Image upload failed. Please try again.');
        }
      }
    );
    myWidget.open();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!mainImagePublicId) {
      alert('Please upload a sample image first for the main DP.');
      return;
    }
    if (!logoImagePublicId) { // Changed from logoImage to logoImagePublicId
      alert('Please upload an overlay logo image.'); // Updated alert message
      return;
    }

    // Prevent submission if there's a slug error
    if (slugError) {
      alert(`Please fix the errors before submitting: ${slugError}`);
      return;
    }

    const payload = {
      mainImageCloudinaryId: mainImagePublicId,
      logoImageCloudinaryId: logoImagePublicId, // Use logoImagePublicId
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      xPos: parseInt(xPos, 10),
      yPos: parseInt(yPos, 10),
      radius: radius, // radius can be 'max' or a number string
      templateName: templateName || "User Custom DP", // Use state or default
      customSlug: slug, // Add customSlug (user-provided slug)
      isPublic: isPublic, // Add isPublic
    };

    const apiUrl = '/api/dp-configurations';

    try {
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      .then(async response => {
        if (response.ok) { // Check for 2xx status codes, typically 201 for POST
          // const data = await response.json(); // Assuming backend sends back the created object or some confirmation
          alert('Custom DP saved successfully to database!');
          navigate('/');
        } else {
          // Try to parse error message from backend if available
          response.json().then(errorData => {
            const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
            alert(`Failed to save custom DP to database. Error: ${errorMessage}`);
            console.error('Failed to save custom DP:', errorMessage);
          }).catch(() => {
            // Fallback if response is not JSON or error parsing JSON
            alert(`Failed to save custom DP to database. HTTP error! status: ${response.status}`);
            console.error('Failed to save custom DP, and error response was not valid JSON. Status:', response.status);
          });
        }
      })
      .catch(networkError => {
        // Handle network errors (e.g., server down, no internet)
        console.error('Network error:', networkError);
        alert(`Failed to save custom DP due to a network error: ${networkError.message}`);
      });
    } catch (error) {
      // Catch any synchronous errors not related to fetch (though less likely here)
      console.error('Error in handleSubmit:', error);
      alert(`An unexpected error occurred: ${error.message}`);
    }
  };

  // Prepare props for DpGenerator preview
  const previewProps = {
    width: parseInt(width, 10) || 0,
    height: parseInt(height, 10) || 0,
    xPos: parseInt(xPos, 10) || 0,
    yPos: parseInt(yPos, 10) || 0,
    radius: radius || '0', // DpGenerator handles '0' or 'max' or number string
    logoImage: logoImagePublicId || 'plain_pw7uoh', // Use logoImagePublicId, fallback to default
    mainImage: mainImagePublicId || 'sample', // Default main image if user hasn't uploaded (sampleImageFile removed)
    templateName: templateName, // Pass templateName to DpGenerator
    isPreviewMode: true // Add this line
  };


  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Create Your Custom DP</h2>
      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            {/* Template Name Field - Moved to top */}
            <div className="mb-3">
              <label htmlFor="templateName" className="form-label">
                Template Name
              </label>
              <input
                type="text"
                className="form-control"
                id="templateName"
                value={templateName}
                onChange={handleTemplateNameChange}
                placeholder="Enter a name for this template"
                required
              />
            </div>

            {/* New Slug Field */}
            <div className="mb-3">
              <label htmlFor="slug" className="form-label">
                Custom Slug (Optional)
              </label>
              <input
                type="text"
                className={`form-control ${slugError ? "is-invalid" : ""}`}
                id="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="e.g., my-cool-dp (auto-generated if blank)"
              />
              {slugError && (
                <div className="invalid-feedback d-block">{slugError}</div>
              )}
            </div>

            {/* Width and Height side by side */}
            <div className="row mb-3">
              <div className="col-6">
                <label htmlFor="width" className="form-label">
                  Photo Width
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="width"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label htmlFor="height" className="form-label">
                  Photo Height
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* xPos and yPos side by side */}
            <div className="row mb-3">
              <div className="col-6">
                <label htmlFor="xPos" className="form-label">
                  Photo X Position
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="xPos"
                  value={xPos}
                  onChange={(e) => setXPos(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label htmlFor="yPos" className="form-label">
                  Photo Y Position
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="yPos"
                  value={yPos}
                  onChange={(e) => setYPos(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="radius" className="form-label">
                Photo Radius (0 for square, 'max' for circle, or number)
              </label>
              <input
                type="text"
                className="form-control"
                id="radius"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="e.g., 0, 50, max"
                required
              />
            </div>

            {/* New Is Public Checkbox */}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isPublic">
                Make this Public?
              </label>
            </div>

            <div className="row mb-3">
              <div className="col-6">
                {/* Updated Main DP Image Upload */}
                <label className="form-label">Main DP Image (DP Frame)</label>
                <button
                  type="button"
                  className="btn btn-info d-block mb-2"
                  onClick={uploadSampleImageViaWidget}
                  disabled={uploading}
                >
                  {uploading && !mainImagePublicId
                    ? "Uploading Main Image..."
                    : "Upload Main Image via Cloudinary"}
                </button>
                {uploading && (
                  <div className="text-primary mt-2">
                    Processing image... Please wait.
                  </div>
                )}
                {!uploading && mainImagePublicId && (
                  //insert green checkmark icon
                  <p className="text-success mt-1">Main image uploaded </p>
                )}
                {!uploading && !mainImagePublicId && (
                  <p className="text-muted mt-1">No main image uploaded yet.</p>
                )}
              </div>
              <div className="col-6">
                {/* Updated Logo Upload */}
                <label className="form-label">Your Logo or Image Sample</label>
                <button
                  type="button"
                  className="btn btn-secondary d-block mb-2"
                  onClick={uploadLogoImageViaWidget}
                  disabled={uploading}
                >
                  {uploading
                    ? "Uploading Logo..."
                    : "Upload Logo via Cloudinary"}
                </button>
                {logoImagePublicId && (
                  <p className="text-success mt-1">Logo uploaded </p>
                )}
                {!logoImagePublicId && (
                  <p className="text-muted mt-1">No logo uploaded yet.</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              disabled={uploading || !!slugError}
            >
              {uploading ? "Uploading..." : "Create and Save DP Profile"}
            </button>
          </form>
        </div>
        <div className="col-md-6">
          <h4 className="text-center mb-3">Live Preview</h4>
          <div
            style={{
              border: "1px solid #eee",
              padding: "10px",
              borderRadius: "5px",
              background: "#f9f9f9",
            }}
          >
            {/* Render DpGenerator with props from form state for live preview */}
            <DpGenerator {...previewProps} />
          </div>
          {(!mainImagePublicId || !logoImagePublicId) && ( // Check logoImagePublicId
            <div className="alert alert-info mt-3" role="alert">
              {!mainImagePublicId && (
                <p className="mb-1">
                  Upload a "Main DP Image" to see it in the preview.
                </p>
              )}
              {!logoImagePublicId && (
                <p className="mb-0">
                  Upload an "Overlay Logo Image" to see it in the preview.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDpForm;