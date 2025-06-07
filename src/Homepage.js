import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import data from "./data";
import "./App.css";
import "./Homepage.css";

function Homepage() {
  const templates = Object.entries(data); // Get an array of [key, value] pairs
  const [publicDpList, setPublicDpList] = useState([]);
  const [privateDpList, setPrivateDpList] = useState([]); // New state for private DPs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllDps = async () => {
      // Renamed function
      setLoading(true);
      setError(null);
      try {
        // Use the endpoint that fetches all DPs, including non-public
        const apiUrl = window.API_BASE_URL ? 
          `${window.API_BASE_URL}/dp-configurations/public/all` : 
          "/api/dp-configurations/public/all";
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData = await response.json();

        // Filter DPs into public and private lists
        const publicDps = fetchedData.filter((dp) => dp.isPublic !== false); // Treat undefined isPublic as public
        const privateDps = fetchedData.filter((dp) => dp.isPublic === false);

        setPublicDpList(publicDps);
        setPrivateDpList(privateDps);
        setError(null);
      } catch (e) {
        console.error("Failed to fetch DP configurations:", e); // Generic error message
        setError("Failed to load DP configurations. Please try again later.");
        setPublicDpList([]);
        setPrivateDpList([]); // Ensure private list is also empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchAllDps(); // Call the renamed function
  }, []);

  return (
    <div className="container mt-5">
      <div className="homepage-header text-center mb-5">
        <h1 className="display-4 fw-bold">Create Your Perfect Display Picture</h1>
        <p className="lead">
          Choose from our templates or create your own custom design
        </p>
        <Link to="/create-custom-dp" className="btn btn-success btn-lg mt-3">
          Create Custom DP
        </Link>
      </div>

      {/* Section for User Generated Configurations from API */}
      <h2 className="section-title text-center">User Generated Configurations</h2>
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading configurations...</p>
        </div>
      )}
      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && publicDpList.length > 0 && (
        <div className="row">
          {publicDpList.map((dpConfig) => (
            <div key={dpConfig.slug || dpConfig._id} className="col-md-4 mb-4">
              {" "}
              {/* Use slug or _id for key */}
              <div className="card">
                <img
                  src={`https://res.cloudinary.com/dmlyic7tt/image/upload/w_300,h_300,c_fill/${dpConfig.mainImageCloudinaryId}`}
                  className="card-img-top"
                  alt={dpConfig.templateName || "User Generated DP"}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">
                    {dpConfig.templateName || "User Generated DP"}
                  </h5>
                  {/* Optional: Add description if available in dpConfig */}
                  {/* <p className="card-text">{dpConfig.description || 'A user generated DP.'}</p> */}
                  <div className="card-actions">
                    <Link 
                      to={`/dp/${dpConfig.slug}`} 
                      state={{ dpConfig: dpConfig }}
                      className="btn btn-primary">
                      Customize
                    </Link>
                    <button 
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/dp/${dpConfig.slug}`;
                        if (navigator.share) {
                          navigator.share({
                            title: dpConfig.templateName || 'DP Generator',
                            text: 'Check out this display picture template!',
                            url: shareUrl
                          }).catch(err => console.error('Error sharing:', err));
                        } else {
                          // Fallback for browsers that don't support the Web Share API
                          const tempInput = document.createElement('input');
                          document.body.appendChild(tempInput);
                          tempInput.value = shareUrl;
                          tempInput.select();
                          document.execCommand('copy');
                          document.body.removeChild(tempInput);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="btn btn-share">
                      <i className="bi bi-share me-1"></i> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && publicDpList.length === 0 && (
        <div className="alert alert-info text-center" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          No public DP configurations found.
        </div>
      )}

      {/* Section for Private DPs from API */}
      {!loading && !error && privateDpList.length > 0 && (
        <>
          <div className="section-divider"></div>
          <h2 className="section-title text-center">Your Private DPs</h2>
          <div className="row">
            {privateDpList.map((dpConfig) => (
              <div
                key={dpConfig.slug || dpConfig._id}
                className="col-md-4 mb-4"
              >
                <div className="card">
                  <img
                    src={`https://res.cloudinary.com/dmlyic7tt/image/upload/w_300,h_300,c_fill/${dpConfig.mainImageCloudinaryId}`}
                    className="card-img-top"
                    alt={dpConfig.templateName || "Private DP"}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {dpConfig.templateName || "Private DP"}
                    </h5>
                    <div className="card-actions">
                      <Link
                        to={`/dp/${dpConfig.slug}`}
                        state={{ dpConfig: dpConfig, source: "privateDpLink" }}
                        className="btn btn-secondary"
                      >
                        Customize
                      </Link>
                      <button 
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/dp/${dpConfig.slug}`;
                          if (navigator.share) {
                            navigator.share({
                              title: dpConfig.templateName || 'DP Generator',
                              text: 'Check out this display picture template!',
                              url: shareUrl
                            }).catch(err => console.error('Error sharing:', err));
                          } else {
                            // Fallback for browsers that don't support the Web Share API
                            const tempInput = document.createElement('input');
                            document.body.appendChild(tempInput);
                            tempInput.value = shareUrl;
                            tempInput.select();
                            document.execCommand('copy');
                            document.body.removeChild(tempInput);
                            alert('Link copied to clipboard!');
                          }
                        }}
                        className="btn btn-share">
                        <i className="bi bi-share me-1"></i> Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Optional: Message if no private DPs found */}
      {/* {!loading && !error && privateDpList.length === 0 && publicDpList.length > 0 && ( // Only show if public DPs were loaded, to avoid confusion during loading/error states
        <p className="text-center">You have no private DP configurations.</p>
      )} */}

      <div className="section-divider"></div>
      {/* Keep standard templates */}
      <h2 className="section-title text-center">Standard Templates</h2>
      <div className="row">
        {templates.map(([eventKey, template]) => (
          <div key={eventKey} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={`https://res.cloudinary.com/dmlyic7tt/image/upload/w_300,h_300,c_fill/${template.mainImage}`}
                className="card-img-top"
                alt={`${template.name || eventKey} preview`}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">
                  {template.name ||
                    eventKey
                      .replace(/-/g, " ")
                      .replace(/(^|\s)\w/g, (l) => l.toUpperCase())}
                </h5>
                <p className="card-text">
                  {template.description || "A cool template for your DP."}
                </p>
                <div className="card-actions">
                  <Link to={`/${eventKey}`} className="btn btn-primary">
                    Customize
                  </Link>
                  <button 
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/${eventKey}`;
                      if (navigator.share) {
                        navigator.share({
                          title: template.name || eventKey.replace(/-/g, " ").replace(/(^|\s)\w/g, (l) => l.toUpperCase()),
                          text: 'Check out this display picture template!',
                          url: shareUrl
                        }).catch(err => console.error('Error sharing:', err));
                      } else {
                        // Fallback for browsers that don't support the Web Share API
                        const tempInput = document.createElement('input');
                        document.body.appendChild(tempInput);
                        tempInput.value = shareUrl;
                        tempInput.select();
                        document.execCommand('copy');
                        document.body.removeChild(tempInput);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="btn btn-share">
                    <i className="bi bi-share me-1"></i> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Homepage;
