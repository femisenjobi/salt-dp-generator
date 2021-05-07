import React from 'react';
import {
  useParams
} from "react-router-dom";
import './App.css';
import data from './data';
import DpGenerator from './DpGenerator';


function Validator() {
  const params = useParams();
  const eventData = data[params.event];
  if(!eventData){
    return null;
  }

  return (
    <DpGenerator {...eventData} />
  );
}

export default Validator;
