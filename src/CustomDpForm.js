import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import DpGenerator from './DpGenerator'; // Import DpGenerator

const CustomDpForm = () => {
  // Initial state values are mostly numbers or string representations of numbers
  const [width, setWidth] = useState('300');
  const [height, setHeight] = useState('300');
  const [xPos, setXPos] = useState('0');
  const [yPos, setYPos] = useState('0');
  const [logoImage, setLogoImage] = useState(''); // User will input this Cloudinary ID
  const [radius, setRadius] = useState('0'); // DpGenerator might expect string for 'max' or numbers

  const [sampleImageFile, setSampleImageFile] = useState(null);
  const [mainImagePublicId, setMainImagePublicId] = useState(''); // For the user's uploaded photo
  const [uploading, setUploading] = useState(false);
  const [sampleImagePreview, setSampleImagePreview] = useState(''); // Local preview before Cloudinary URL

  const history = useHistory();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSampleImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSampleImagePreview(reader.result); // Show local preview immediately
      };
      reader.readAsDataURL(file);
      // Trigger Cloudinary upload
      uploadSampleImageViaWidget(file); // Changed to use the widget uploader
    }
  };

  // Using the widget for upload as it provides more features like cropping
  const uploadSampleImageViaWidget = (fileToUpload) => {
    if (!window.cloudinary) {
      alert('Cloudinary widget is not loaded. Please check your internet connection or try refreshing.');
      return;
    }
    setUploading(true);
    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloud_name: 'dmlyic7tt',
        upload_preset: 'ml_default',
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
          // No need for sampleImagePreview from Cloudinary here, DpGenerator will show it
          setSampleImageFile(null);
        } else if (error) {
          console.error('Upload error:', error);
          alert('Image upload failed. Please try again.');
          setSampleImagePreview(''); // Clear local preview on error
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
    if (!logoImage) {
        alert('Please provide a Cloudinary Public ID for the overlay logo.');
        return;
    }

    const newCustomDp = {
      // Ensure values are parsed correctly for storage
      width: parseInt(width, 10) || 0,
      height: parseInt(height, 10) || 0,
      xPos: parseInt(xPos, 10) || 0,
      yPos: parseInt(yPos, 10) || 0,
      logoImage,
      radius: radius, // Keep as string if 'max' is a possibility, or parse if only numbers
      mainImage: mainImagePublicId,
      name: `Custom DP ${Date.now()}`,
      description: 'User-created custom DP configuration.',
    };

    try {
      const existingDps = JSON.parse(localStorage.getItem('customDpList')) || [];
      const updatedDps = [...existingDps, newCustomDp];
      localStorage.setItem('customDpList', JSON.stringify(updatedDps));
      alert('Custom DP saved successfully!');
      history.push('/');
    } catch (error) {
      console.error('Failed to save custom DP to localStorage:', error);
      alert('Failed to save custom DP. Please try again.');
    }
  };

  // Prepare props for DpGenerator preview
  const previewProps = {
    width: parseInt(width, 10) || 0,
    height: parseInt(height, 10) || 0,
    xPos: parseInt(xPos, 10) || 0,
    yPos: parseInt(yPos, 10) || 0,
    radius: radius || '0', // DpGenerator handles '0' or 'max' or number string
    logoImage: logoImage || 'plain_pw7uoh', // Default logo if user hasn't entered one
    mainImage: mainImagePublicId || 'sample', // Default main image if user hasn't uploaded
    isPreviewMode: true // Add this line
  };


  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Create Your Custom DP</h2>
      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            {/* Form Inputs: Width, Height, XPos, YPos, LogoImage, Radius */}
            <div className="mb-3">
              <label htmlFor="width" className="form-label">Logo Width</label>
              <input type="number" className="form-control" id="width" value={width} onChange={(e) => setWidth(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="height" className="form-label">Logo Height</label>
              <input type="number" className="form-control" id="height" value={height} onChange={(e) => setHeight(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="xPos" className="form-label">Logo X Position</label>
              <input type="number" className="form-control" id="xPos" value={xPos} onChange={(e) => setXPos(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="yPos" className="form-label">Logo Y Position</label>
              <input type="number" className="form-control" id="yPos" value={yPos} onChange={(e) => setYPos(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="logoImage" className="form-label">Overlay Logo Image (Cloudinary Public ID)</label>
              <input type="text" className="form-control" id="logoImage" value={logoImage} onChange={(e) => setLogoImage(e.target.value)} placeholder="e.g., v12345/logos/my_logo" required />
            </div>
            <div className="mb-3">
              <label htmlFor="radius" className="form-label">Logo Radius (0 for square, 'max' for circle, or number)</label>
              <input type="text" className="form-control" id="radius" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="e.g., 0, 50, max" required />
            </div>

            <div className="mb-3">
              <label htmlFor="sampleImage" className="form-label">Main DP Image (Your Photo)</label>
              <input type="file" className="form-control" id="sampleImage" onChange={handleFileChange} accept="image/*" />
              {uploading && <div className="text-primary mt-2">Uploading image via Cloudinary widget...</div>}
              {!uploading && mainImagePublicId && (
                 <p className="text-success mt-2">Main image uploaded: {mainImagePublicId}</p>
              )}
              {!uploading && !mainImagePublicId && sampleImagePreview && (
                <div className="mt-3">
                  <p>Local Preview (uploading soon):</p>
                  <img src={sampleImagePreview} alt="Local sample preview" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px dashed #ccc' }} />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-3" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Create and Save DP Profile'}
            </button>
          </form>
        </div>
        <div className="col-md-6">
          <h4 className="text-center mb-3">Live Preview</h4>
          <div style={{border: '1px solid #eee', padding: '10px', borderRadius: '5px', background: '#f9f9f9' }}>
            {/* Render DpGenerator with props from form state for live preview */}
            <DpGenerator {...previewProps} />
          </div>
          {(!mainImagePublicId || !logoImage) && (
            <div className="alert alert-info mt-3" role="alert">
              {!mainImagePublicId && <p className="mb-1">Upload a "Main DP Image" to see it in the preview.</p>}
              {!logoImage && <p className="mb-0">Enter an "Overlay Logo Image ID" to see the logo in the preview.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDpForm;
