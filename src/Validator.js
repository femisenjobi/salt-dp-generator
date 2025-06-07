import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useLocation } from "react-router-dom";
import './App.css';
import data from './data'; // Predefined templates
import DpGenerator from './DpGenerator';

function Validator() {
  const params = useParams();
  const location = useLocation(); // Access location
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
        // Check for DP config passed via state (from any source)
        if (location.state && location.state.dpConfig) {
          const { dpConfig: stateDpConfig } = location.state;
          // Map API fields from stateDpConfig to DpGenerator props
          setDpConfig({
            mainImage: stateDpConfig.mainImageCloudinaryId,
            logoImage: stateDpConfig.logoImageCloudinaryId,
            width: stateDpConfig.width,
            height: stateDpConfig.height,
            xPos: stateDpConfig.xPos,
            yPos: stateDpConfig.yPos,
            radius: stateDpConfig.radius !== undefined ? stateDpConfig.radius : 0,
            templateName: stateDpConfig.templateName,
            // isPreviewMode should be false or rely on DpGenerator's default
          });
          setLoading(false);
          setNotFound(false);
          return; // Config found in state, no need to fetch
        }

        if (params.slug) {
          // This is /dp/:slug
          try {
            const response = await fetch(`/api/dp-configurations/${params.slug}`);
            if (!response.ok) {
              if (response.status === 404) {
                setNotFound(true);
              } else {
                throw new Error(`Failed to fetch DP configuration. Status: ${response.status}`);
              }
              return;
            }
            const fetchedData = await response.json();
            // Map API fields to DpGenerator props
            setDpConfig({
              mainImage: fetchedData.mainImageCloudinaryId,
              logoImage: fetchedData.logoImageCloudinaryId,
              width: fetchedData.width,
              height: fetchedData.height,
              xPos: fetchedData.xPos,
              yPos: fetchedData.yPos,
              radius: fetchedData.radius !== undefined ? fetchedData.radius : 0, // Default radius if not in fetchedData
              templateName: fetchedData.templateName,
              // isPreviewMode should be false or rely on DpGenerator's default
            });
          } catch (error) {
            console.error("Error fetching DP configuration:", error);
            // If API fails, check if it's a predefined template
            if (data[params.slug]) {
              setDpConfig(data[params.slug]);
            } else {
              setNotFound(true);
            }
          }
        } else if (params.id) { // Handles /dp/custom/:id
          const customDpId = parseInt(params.id, 10);
          const customDpListString = localStorage.getItem('customDpList');
          if (customDpListString) {
            const customDpList = JSON.parse(customDpListString);
            if (customDpId >= 0 && customDpId < customDpList.length) {
              // Assuming customDpList items are already in the correct format for DpGenerator
              // Or map them if necessary
              setDpConfig(customDpList[customDpId]);
            } else {
              setNotFound(true);
            }
          } else {
            setNotFound(true); // No list, so ID cannot be found
          }
        } else if (params.eventKey) { // Handles /:eventKey for predefined DPs from data.js
          if (data[params.eventKey]) {
            setDpConfig(data[params.eventKey]);
          } else {
            setNotFound(true);
          }
        } else {
          // No relevant parameters found
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
    return <div className="container mt-5 text-center"><p>Loading DP configuration...</p><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>;
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
    // Show error message instead of redirecting
    return (
      <div className="container mt-5 text-center alert alert-danger" role="alert">
        <h4>Configuration Not Found</h4>
        <p>The requested DP configuration could not be found.</p>
        <a href="/" className="btn btn-primary mt-3">Return to Homepage</a>
      </div>
    );
  }

  // Ensure all necessary props are present, providing defaults if some are optional
  // This step might be redundant if setDpConfig always structures the object correctly
  const finalProps = {
    radius: 0, // Default radius if not specified
    ...dpConfig, // Spread the loaded config
    isPreviewMode: false // Explicitly ensure interactive mode for shared DPs
  };

  // Note: The templateName from fetched config will be passed to DpGenerator
  // DpGenerator itself has an input for templateName if !isPreviewMode.
  // This means the loaded templateName will be displayed in that input field.

  return (
    <DpGenerator {...finalProps} />
  );
}

export default Validator;
