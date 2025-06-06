import React from 'react';
import {
  useParams,
  Redirect // Import Redirect
} from "react-router-dom";
import './App.css';
import data from './data';
import DpGenerator from './DpGenerator';


function Validator() {
  const params = useParams();
  const eventData = data[params.event];
  if(!eventData){
    // Redirect to homepage if event data is not found
    return <Redirect to="/" />;
  }

  return (
    <DpGenerator {...eventData} />
  );
}

export default Validator;
