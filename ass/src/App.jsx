import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    handleUpload(selectedFile); 
  };

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const capturedFile = new File([blob], "capturedImage.jpg", { type: "image/jpeg" });
        
        setFile(capturedFile);
        setUseCamera(false); 

        handleUpload(capturedFile);
      } else {
        console.error("Screenshot failed: image source is null");
      }
    } else {
      console.error("Webcam reference is null");
    }
  };

  const handleUpload = async (uploadFile = file) => {
    if (!uploadFile) {
      alert("No file to upload. Please capture or select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('document', uploadFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData);
      setExtractedData(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="container">
      <h1>Document Capture</h1>
      <button onClick={() => setUseCamera(!useCamera)}>
        {useCamera ? 'Switch to Upload' : 'Use Camera'}
      </button>
      {useCamera ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
          />
          <button onClick={captureImage}>Capture</button>
        </>
      ) : (
        <input type="file" onChange={handleFileChange} />
      )}
      {!useCamera && <button onClick={() => handleUpload(file)}>Upload</button>}
      {extractedData && (
        <div className="extracted-data">
          <h2>Extracted Data</h2>
          <pre>{JSON.stringify(extractedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
