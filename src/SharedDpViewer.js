import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const SharedDpViewer = () => {
  const { dpId } = useParams();
  const [dpData, setDpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayUrl, setDisplayUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const CLOUD_NAME = 'dmlyic7tt'; // Your Cloudinary cloud name

  useEffect(() => {
    setLoading(true);
    setError(null);
    setDpData(null); // Reset data on dpId change

    // Simulate API call
    setTimeout(() => {
      // Check against a generic pattern if IDs are dynamic like `simulatedUniqueId<timestamp>`
      // For this example, we'll check for a specific pattern or a known test ID.
      // The ID generated in CustomDpForm was `simulatedUniqueId${Date.now()}`.
      // We can't know the exact ID here without passing it around or fetching a list.
      // So, for simulation, let's assume any ID starting with "simulatedUniqueId" is valid for now,
      // or use a specific one for testing if needed.
      // For a more robust test, we'd use a specific ID like "simulatedUniqueId123".
      if (dpId && dpId.startsWith("simulatedUniqueId")) { // Looser check for example
      // if (dpId === "simulatedUniqueId123") { // Stricter check for a specific test case
        const sampleData = {
          mainImage: "main_image_placeholder_id", // Replace with a real Cloudinary public ID
          logoImage: "logo_placeholder_id",       // Replace with a real Cloudinary public ID
          width: 250,
          height: 250,
          xPos: 10,
          yPos: 10,
          radius: 20,
          name: `My Shared DP (${dpId})`, // Include dpId in name for clarity
        };
        setDpData(sampleData);
      } else {
        setError(`DP with ID "${dpId}" not found or invalid.`);
      }
      setLoading(false);
    }, 1000);
  }, [dpId]);

  useEffect(() => {
    if (dpData) {
      const { mainImage, logoImage, width, height, xPos, yPos, radius } = dpData;
      const transformedLogoId = logoImage.replace(/\//g, ':');

      // Display URL (500x500)
      const displayTransformations = [
        `w_500`, `h_500`, `c_fill`
      ];
      const displayOverlayOptions = [
        `l_${transformedLogoId}`,
        `w_${width}`, `h_${height}`, `c_fill`,
        `x_${xPos}`, `y_${yPos}`, `r_${radius}`
      ];
      setDisplayUrl(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${displayTransformations.join(',')}/${displayOverlayOptions.join(',')}/${mainImage}`);

      // Download URL (1080x1080, with attachment)
      const downloadTransformations = [
        `fl_attachment:${dpData.name || 'custom_dp'}`, // Filename for download
        `w_1080`, `h_1080`, `c_fill`
      ];
      // Overlay options are the same for download in this case
      setDownloadUrl(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${downloadTransformations.join(',')}/${displayOverlayOptions.join(',')}/${mainImage}`);
    } else {
      setDisplayUrl('');
      setDownloadUrl('');
    }
  }, [dpData]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <p>Loading DP...</p>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-danger">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!dpData) {
    // This case might be redundant if error is always set when dpData is null after loading
    return (
      <div className="container mt-5 text-center">
        <p>DP data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 text-center">
      <h2>{dpData.name}</h2>
      {displayUrl ? (
        <img
          src={displayUrl}
          alt={`Preview of ${dpData.name}`}
          className="img-fluid my-3"
          style={{ border: '1px solid #ccc', maxWidth: '500px', maxHeight: '500px' }}
        />
      ) : (
        <p>Generating image preview...</p>
      )}
      {downloadUrl && (
        <div className="mt-3">
          <a href={downloadUrl} className="btn btn-success" download>
            Download DP (1080p)
          </a>
        </div>
      )}
      <div className="mt-4 p-3 bg-light border rounded">
        <h4>DP Configuration Details:</h4>
        <ul className="list-unstyled">
          <li><strong>Main Image ID:</strong> {dpData.mainImage}</li>
          <li><strong>Logo Image ID:</strong> {dpData.logoImage}</li>
          <li><strong>Logo Size:</strong> {dpData.width}x{dpData.height}</li>
          <li><strong>Logo Position:</strong> X: {dpData.xPos}, Y: {dpData.yPos}</li>
          <li><strong>Logo Radius:</strong> {dpData.radius}</li>
        </ul>
      </div>
    </div>
  );
};

export default SharedDpViewer;
