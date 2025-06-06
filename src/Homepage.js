import React from 'react';
import { Link } from 'react-router-dom';
import data from './data';
import './App.css'; // Assuming common styles are in App.css

function Homepage() {
  const templates = Object.entries(data); // Get an array of [key, value] pairs

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1>Choose a DP Template</h1>
        <p className="lead">Select a template below to customize your display picture.</p>
      </div>
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
