import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import data from './data';
import './App.css'; // Assuming common styles are in App.css

function Homepage() {
  const templates = Object.entries(data); // Get an array of [key, value] pairs
  const [publicDpList, setPublicDpList] = useState([]);
  const [privateDpList, setPrivateDpList] = useState([]); // New state for private DPs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchAllDps = async () => { // Renamed function
      setLoading(true);
      setError(null);
      try {
      // Use the endpoint that fetches all DPs, including non-public
      const response = await fetch('/api/dp-configurations/public/all');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData = await response.json();

      // Filter DPs into public and private lists
      const publicDps = fetchedData.filter(dp => dp.isPublic !== false); // Treat undefined isPublic as public
      const privateDps = fetchedData.filter(dp => dp.isPublic === false);

      setPublicDpList(publicDps);
      setPrivateDpList(privateDps);
        setError(null);
      } catch (e) {
      console.error('Failed to fetch DP configurations:', e); // Generic error message
        setError('Failed to load DP configurations. Please try again later.');
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
      <div className="text-center mb-4">
        <h1>Choose a DP Template</h1>
        <p className="lead">Select a template below to customize your display picture.</p>
        <Link to="/create-custom-dp" className="btn btn-success mb-4">
          Create Custom DP
        </Link>
      </div>

      {/* Section for User Generated Configurations from API */}
      <h2 className="text-center mb-4">User Generated Configurations</h2>
      {loading && <p className="text-center">Loading configurations...</p>}
      {error && <p className="text-center text-danger">{error}</p>}
      {!loading && !error && publicDpList.length > 0 && (
        <div className="row">
          {publicDpList.map((dpConfig) => (
            <div key={dpConfig.slug || dpConfig._id} className="col-md-4 mb-4"> {/* Use slug or _id for key */}
              <div className="card">
                <img
                  src={`https://res.cloudinary.com/dmlyic7tt/image/upload/w_300,h_300,c_fill/${dpConfig.mainImageCloudinaryId}`}
                  className="card-img-top"
                  alt={dpConfig.templateName || 'User Generated DP'}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{dpConfig.templateName || 'User Generated DP'}</h5>
                  {/* Optional: Add description if available in dpConfig */}
                  {/* <p className="card-text">{dpConfig.description || 'A user generated DP.'}</p> */}
                  <Link to={`/dp/${dpConfig.slug}`} className="btn btn-primary">
                    Customize
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && publicDpList.length === 0 && (
        <p className="text-center">No public DP configurations found.</p>
      )}

      {/* Section for Private DPs from API */}
      {!loading && !error && privateDpList.length > 0 && (
        <>
          <hr className="my-4" />
          <h2 className="text-center mb-4">Your Private DPs</h2>
          <div className="row">
            {privateDpList.map((dpConfig) => (
              <div key={dpConfig.slug || dpConfig._id} className="col-md-4 mb-4">
                <div className="card">
                  <img
                    src={`https://res.cloudinary.com/dmlyic7tt/image/upload/w_300,h_300,c_fill/${dpConfig.mainImageCloudinaryId}`}
                    className="card-img-top"
                    alt={dpConfig.templateName || 'Private DP'}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{dpConfig.templateName || 'Private DP'}</h5>
                    <Link to={`/dp/${dpConfig.slug}`} className="btn btn-secondary mr-2"> {/* Changed btn-primary to btn-secondary for differentiation */}
                      Customize
                    </Link>
                    <Link to={`/dp/${dpConfig.slug}`} className="btn btn-info"> {/* Share button */}
                      Share
                    </Link>
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


      <hr className="my-4" />
      {/* Keep standard templates */}
      <h2 className="text-center mb-4">Standard Templates</h2>
      <div className="row">
        {templates.map(([eventKey, template]) => (
          <div key={eventKey} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={`https://res.cloudinary.com/dmlyic7tt/image/upload/w_300,h_300,c_fill/${template.mainImage}`}
                className="card-img-top"
                alt={`${template.name || eventKey} preview`}
                style={{height: '200px', objectFit: 'cover'}}
              />
              <div className="card-body">
                <h5 className="card-title">{template.name || eventKey.replace(/-/g, ' ').replace(/(^|\s)\w/g, l => l.toUpperCase())}</h5>
                <p className="card-text">{template.description || 'A cool template for your DP.'}</p>
                <Link to={`/${eventKey}`} className="btn btn-primary">
                  Customize
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Homepage;
