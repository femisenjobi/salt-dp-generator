import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from "react-router-dom";
import './App.css';
import data from './data'; // Predefined templates
import DpGenerator from './DpGenerator';

function Validator() {
  const params = useParams();
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
        if (params.slug) {
          // Check if this is the /dp/:slug route, not /dp/custom/:id
          // The route order in App.js should ideally prevent /dp/custom/ reaching here if 'slug' is the param name.
          // However, if 'id' from '/dp/custom/:id' could also be named 'slug' in params object, this check is important.
          // For this task, we assume 'slug' is distinct from 'id' used in '/dp/custom/:id'.
          if (params.slug === 'custom') {
            // This is likely part of /dp/custom/:id, let the 'id' logic handle it if :id is also present
            // Or, if /dp/custom/:id is matched and 'custom' is the slug, and 'id' is another param.
            // This specific if condition might need adjustment based on exact routing for /dp/custom/:id
            // For now, if we hit /dp/custom, and there's no further ID, it's likely an invalid path.
            // Or if `id` is the actual slug for the custom route.
            // Let's assume /dp/custom/:id is handled by the params.id block for now.
            // This block is for /dp/:slug where slug is NOT 'custom'
            if (params.id) { // This means it's /dp/custom/:id
              // Already handled by params.id logic path
            } else {
              // This is /dp/:slug
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
  }, [params.slug, params.id, params.eventKey]);

  if (loading) {
    return <div className="container mt-5 text-center"><p>Loading DP configuration...</p><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>;
  }

  if (error) {
    return <div className="container mt-5 text-center alert alert-danger" role="alert"><p>Error loading DP configuration: {error}</p><p>You will be redirected to the homepage.</p>{setTimeout(() => window.location.href = '/', 3000)}</div>;
  }

  if (notFound || !dpConfig) {
    // Redirect to homepage if not found or dpConfig is still null after attempting to load
    // Add a small delay or message before redirecting for better UX if desired
    console.warn('DP Configuration not found with given parameters, redirecting.');
    return <Navigate to="/" replace />;
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
