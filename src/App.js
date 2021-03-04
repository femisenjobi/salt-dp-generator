import React, { useState } from 'react';
import logo from './logo.jpeg';
import placeHolder from './sample.jpeg';
import './App.css';

function App() {
  const [image, setImage] = useState();
  const [loading, setloading] = useState(false);
  const uploadWidget = () => {
    setloading(true);
    window.cloudinary.openUploadWidget(
      { cloud_name: 'dmlyic7tt', upload_preset: 'ml_default'},
      function(error, result) {
        setImage(`https://res.cloudinary.com/dmlyic7tt/image/upload/w_1080,h_1080,c_fill/l_${result[0].public_id},w_410,h_410,c_fill,x_0,y_-170,r_max/v1614867226/ichoosechallenge.jpg`);
        setloading(false)
      },
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8 col-lg-6 offset-md-2 offset-lg-3">
          <div className="row d-flex justify-content-center">
            <img src={logo} alt="logo" className="img-responsive" style={{height: '120px'}} />
          </div>
          <div className="row d-flex justify-content-center">
            <h3>Create your own custom DP</h3>
          </div>
          <div className="row d-flex justify-content-center mb-3">
            {
              loading ?
              <div class="spinner-border" role="status" style={{height: '200px', width: '200px', margin: '100px'}}>
                <span class="sr-only">Loading...</span>
              </div> :
              <img src={image || placeHolder} alt="logo" className="img-responsive" style={{height: '400px'}} />
            }
          </div>
          <div className="row d-flex justify-content-center">
            <div className="main">
              <div className="upload d-flex justify-content-around">
                <button onClick={uploadWidget} className="upload-button btn btn-primary">
                  Upload Image
                </button>
                <a href={image ? image : '#'} download={'MySALTDP.jpg'} className={`btn btn-primary ${image ? '' : 'disabled'} ml-3`} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
