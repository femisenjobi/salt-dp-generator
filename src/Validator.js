import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from "react-router-dom";
import './App.css';
import data from './data';
import DpGenerator from './DpGenerator';

function Validator() {
  const params = useParams();
  const location = useLocation();
  const [dpConfig, setDpConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setDpConfig(null);

      try {
        if (location.state && location.state.dpConfig) {
          const { dpConfig: stateDpConfig } = location.state;
          setDpConfig({
            mainImage: stateDpConfig.mainImageCloudinaryId,
            logoImage: stateDpConfig.logoImageCloudinaryId,
            width: stateDpConfig.width,
            height: stateDpConfig.height,
            xPos: stateDpConfig.xPos,
            yPos: stateDpConfig.yPos,
            radius: stateDpConfig.radius !== undefined ? stateDpConfig.radius : 0,
            templateName: stateDpConfig.templateName,
          });
          setLoading(false);
          return;
        }

        if (params.slug) {
          try {
            const apiUrl = window.API_BASE_URL ? 
              `${window.API_BASE_URL}/dp-configurations/${params.slug}` : 
              `/api/dp-configurations/${params.slug}`;
              
            const response = await fetch(apiUrl, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              if (response.status === 404) {
                setNotFound(true);
              } else {
                throw new Error(`Failed to fetch DP configuration. Status: ${response.status}`);
              }
              return;
            }
            
            const fetchedData = await response.json();
            setDpConfig({
              mainImage: fetchedData.mainImageCloudinaryId,
              logoImage: fetchedData.logoImageCloudinaryId,
              width: fetchedData.width,
              height: fetchedData.height,
              xPos: fetchedData.xPos,
              yPos: fetchedData.yPos,
              radius: fetchedData.radius !== undefined ? fetchedData.radius : 0,
              templateName: fetchedData.templateName,
            });
          } catch (error) {
            console.error("Error fetching DP configuration:", error);
            if (data[params.slug]) {
              setDpConfig(data[params.slug]);
            } else {
              setNotFound(true);
            }
          }
        } else if (params.id) {
          const customDpId = parseInt(params.id, 10);
          const customDpListString = localStorage.getItem('customDpList');
          if (customDpListString) {
            const customDpList = JSON.parse(customDpListString);
            if (customDpId >= 0 && customDpId < customDpList.length) {
              setDpConfig(customDpList[customDpId]);
            } else {
              setNotFound(true);
            }
          } else {
            setNotFound(true);
          }
        } else if (params.eventKey) {
          if (data[params.eventKey]) {
            setDpConfig(data[params.eventKey]);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (e) {
        console.error("Error fetching or processing DP configuration:", e);
        setError(e.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [params.slug, params.id, params.eventKey, location.state]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <p>Loading DP configuration...</p>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center alert alert-danger" role="alert">
        <h4>Error Loading Configuration</h4>
        <p>{error}</p>
        <a href="/" className="btn btn-primary mt-3">Return to Homepage</a>
      </div>
    );
  }

  if (notFound || !dpConfig) {
    return (
      <div className="container mt-5 text-center alert alert-danger" role="alert">
        <h4>Configuration Not Found</h4>
        <p>The requested DP configuration could not be found.</p>
        <a href="/" className="btn btn-primary mt-3">Return to Homepage</a>
      </div>
    );
  }

  const finalProps = {
    radius: 0,
    ...dpConfig,
    isPreviewMode: false
  };

  return <DpGenerator {...finalProps} />;
}

export default Validator;