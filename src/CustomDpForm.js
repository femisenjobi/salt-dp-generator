import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const CustomDpForm = () => {
  const [width, setWidth] = useState(300); // Default width
  const [height, setHeight] = useState(300); // Default height
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);
  const [logoImage, setLogoImage] = useState(''); // Cloudinary public ID for logo
  const [radius, setRadius] = useState(0);
  const [sampleImageFile, setSampleImageFile] = useState(null);
  const [mainImagePublicId, setMainImagePublicId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sampleImagePreview, setSampleImagePreview] = useState('');
  const [generatedDpPreviewUrl, setGeneratedDpPreviewUrl] = useState('');

  const history = useHistory();

  // Effect to update generated DP preview URL
  useEffect(() => {
    const url = generatePreviewUrl();
    setGeneratedDpPreviewUrl(url);
  }, [mainImagePublicId, logoImage, width, height, xPos, yPos, radius]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSampleImageFile(file);
      // Preview for local file before upload (optional)
      const reader = new FileReader();
      reader.onloadend = () => {
        setSampleImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Immediately trigger upload
      uploadSampleImage(file);
    }
  };

  const uploadSampleImage = (fileToUpload) => {
    if (!window.cloudinary) {
      alert('Cloudinary widget is not loaded. Please check your internet connection or try refreshing.');
      return;
    }
    setUploading(true);
    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloud_name: 'dmlyic7tt', // Replace with your cloud name
        upload_preset: 'ml_default', // Replace with your upload preset
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true, // Optional: enable cropping
        cropping_aspect_ratio: 1, // Optional: enforce square crop for DPs
        show_powered_by: false,
      },
      (error, result) => {
        setUploading(false);
        if (!error && result && result.event === "success") {
          console.log('Uploaded image info: ', result.info);
          setMainImagePublicId(result.info.public_id);
          setSampleImagePreview(`https://res.cloudinary.com/dmlyic7tt/image/upload/w_200,h_200,c_fill/${result.info.public_id}`);
          setSampleImageFile(null); // Clear the file input state after successful upload
        } else if (error) {
          console.error('Upload error:', error);
          alert('Image upload failed. Please try again.');
        }
      }
    );
    // If a file is already selected (e.g., via state from a previous attempt),
    // we could pass it directly: myWidget.open(null, { files: [fileToUpload] });
    // However, createUploadWidget is designed to open its own UI.
    // For direct uploads without widget UI, one would use the XHR/Fetch API.
    // Here, we'll just open the widget. If a file was passed to this function,
    // it was mostly for the direct preview. The user will still select via widget.
    myWidget.open();
  };

  // Simplified direct upload function if widget is not desired for the selected file
  const directUploadSampleImage = (file) => {
    if (!window.cloudinary) {
      alert('Cloudinary widget is not loaded.');
      return;
    }
    setUploading(true);
    const url = `https://api.cloudinary.com/v1_1/dmlyic7tt/image/upload`; // Replace with your cloud name
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Replace with your upload preset

    fetch(url, {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      setUploading(false);
      if (data.secure_url) {
        console.log('Uploaded image info: ', data);
        setMainImagePublicId(data.public_id);
        setSampleImagePreview(data.secure_url); // Or use a transformed version
        setSampleImageFile(null);
      } else {
        console.error('Upload error:', data);
        alert('Image upload failed. Please try again.');
      }
    })
    .catch(err => {
      setUploading(false);
      console.error('Upload error:', err);
      alert('Image upload failed. Please try again.');
    });
  };

  const generatePreviewUrl = () => {
    if (!mainImagePublicId || !logoImage) {
      return ""; // Or null, depending on how you want to handle this
    }

    const cloudName = 'dmlyic7tt';
    const previewWidth = 200;
    const previewHeight = 200;

    // Construct the URL
    // Example: https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_PREVIEW_WIDTH,h_PREVIEW_HEIGHT,c_fill/l_LOGO_PUBLIC_ID,w_LOGO_WIDTH,h_LOGO_HEIGHT,c_fill,x_LOGO_X,y_LOGO_Y,r_LOGO_RADIUS/MAIN_IMAGE_PUBLIC_ID
    // Note: Cloudinary uses `l_` for overlays, and transformations are chained.
    // The logo's public ID needs to be URI encoded if it contains special characters like '/'.
    // However, Cloudinary typically handles this for public IDs like `folder/image`.
    // For simplicity, direct concatenation is used here. Consider encoding `logoImage` if issues arise.

    const transformations = [
      `w_${previewWidth}`,
      `h_${previewHeight}`,
      `c_fill`,
    ];

    const overlayOptions = [
      `l_${logoImage.replace(/\//g, ':')}`, // Replace slashes with colons for overlays
      `w_${width}`,
      `h_${height}`,
      `c_fill`,
      `x_${xPos}`,
      `y_${yPos}`,
      `r_${radius}`,
    ];

    const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(',')}/${overlayOptions.join(',')}/${mainImagePublicId}`;

    return url;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!mainImagePublicId) {
      alert('Please upload a sample image first.');
      return;
    }

    const newCustomDp = {
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      xPos: parseInt(xPos, 10),
      yPos: parseInt(yPos, 10),
      logoImage, // This is the public ID for the logo, entered by user
      radius: parseInt(radius, 10),
      mainImage: mainImagePublicId, // This is the public ID from uploaded sample image
      // Add a name or description if you plan to use it
      name: `Custom DP ${Date.now()}`, // Example name
      description: 'User-created custom DP configuration.',
    };

    try {
      const existingDps = JSON.parse(localStorage.getItem('customDpList')) || [];
      const updatedDps = [...existingDps, newCustomDp];
      localStorage.setItem('customDpList', JSON.stringify(updatedDps));
      alert('Custom DP saved successfully!');
      history.push('/'); // Redirect to homepage
    } catch (error) {
      console.error('Failed to save custom DP to localStorage:', error);
      alert('Failed to save custom DP. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h2 className="text-center mb-4">Create Your Custom DP</h2>
          <form onSubmit={handleSubmit}>
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
              <label htmlFor="radius" className="form-label">Logo Radius (for rounded corners)</label>
              <input type="number" className="form-control" id="radius" value={radius} onChange={(e) => setRadius(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label htmlFor="sampleImage" className="form-label">Main DP Image (Your Photo)</label>
              <input type="file" className="form-control" id="sampleImage" onChange={handleFileChange} accept="image/*" />
              {uploading && <div className="text-info mt-2">Uploading...</div>}
              {sampleImagePreview && !uploading && (
                <div className="mt-3">
                  <p>Preview:</p>
                  <img src={sampleImagePreview} alt="Sample preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                </div>
              )}
              {mainImagePublicId && !uploading && (
                 <p className="text-success mt-2">Main image uploaded: {mainImagePublicId}</p>
              )}
            </div>

            {/* Generated DP Preview Section */}
            {generatedDpPreviewUrl && (
              <div className="mb-3 text-center">
                <h4 className="mb-3">DP Preview:</h4>
                <img
                  src={generatedDpPreviewUrl}
                  alt="DP Preview"
                  className="img-fluid" // Bootstrap class for responsive image
                  style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ccc' }} // Basic styling
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Create and Save DP Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomDpForm;
