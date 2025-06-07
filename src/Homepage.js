import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import data from './data';
import './App.css'; // Assuming common styles are in App.css

function Homepage() {
  const templates = Object.entries(data); // Get an array of [key, value] pairs
  const [publicDpList, setPublicDpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicDps = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dp-configurations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData = await response.json();
        setPublicDpList(fetchedData);
        setError(null);
      } catch (e) {
        console.error('Failed to fetch public DP configurations:', e);
        setError('Failed to load DP configurations. Please try again later.');
        setPublicDpList([]); // Ensure list is empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchPublicDps();
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
