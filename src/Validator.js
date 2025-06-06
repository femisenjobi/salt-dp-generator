import React from 'react';
import {
  useParams,
  Redirect,
  // useHistory // Not strictly needed if Redirect is used for all "not found" cases
} from "react-router-dom";
import './App.css';
import data from './data'; // Predefined templates
import DpGenerator from './DpGenerator';

function Validator() {
  const params = useParams();
  // const history = useHistory(); // For more complex navigation if needed

  let dpProps = null;

  if (params.id !== undefined) { // Check if 'id' param exists (for custom DPs)
    const customDpId = parseInt(params.id, 10);
    try {
      const customDpListString = localStorage.getItem('customDpList');
      if (customDpListString) {
        const customDpList = JSON.parse(customDpListString);
        if (customDpId >= 0 && customDpId < customDpList.length) {
          dpProps = customDpList[customDpId];
        } else {
          console.warn(`Custom DP with id ${customDpId} not found or index out of bounds.`);
        }
      } else {
        console.warn('customDpList not found in localStorage.');
      }
    } catch (error) {
      console.error("Error parsing customDpList from localStorage:", error);
      // dpProps remains null, will trigger redirect
    }
  } else if (params.eventKey) { // Check if 'eventKey' param exists (for predefined DPs)
    // Ensure eventKey is not "dp" to avoid conflict if /dp/* was not matched first
    // However, Switch ensures /dp/custom/:id is checked first.
    if (data[params.eventKey]) {
      dpProps = data[params.eventKey];
    } else {
      console.warn(`Event key ${params.eventKey} not found in data.js.`);
    }
  }

  if (!dpProps) {
    // If dpProps is still null (no valid data found), redirect to homepage.
    // alert('The requested DP configuration was not found. Redirecting to homepage.'); // Optional: for user feedback
    return <Redirect to="/" />;
  }

  // Ensure all necessary props are present, providing defaults if some are optional
  // For example, if 'radius' might be missing from older custom DPs:
  const finalProps = {
    radius: 0, // Default radius if not specified
    ...dpProps // Spread the loaded props, potentially overwriting default radius
  };

  return (
    <DpGenerator {...finalProps} />
  );
}

export default Validator;
