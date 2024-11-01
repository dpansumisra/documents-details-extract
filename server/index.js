const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors()); 

const upload = multer({ dest: 'uploads/' });

const extractDynamicFields = (text) => {
    const data = {};
  
    const namePattern = /\b[A-Z]+,\s+[A-Z]+\s+[A-Z]+/;  
    const docNumberPattern = /\b\d{3}\s\d{3}\s\d{3}\b/;  
    const issueDatePattern = /(?:ISS|Wz|iz|WIZ|ISSUE)\s*[\d/]{8,10}/i;  
    const expiryDatePattern = /(?:EXP|We|WX|EXPIRY|EXPIRES)\s*[\d/]{8,10}/i;  
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      data.name = nameMatch[0].replace(',', '').replace(/\s+/g, ' ');  
    }
  
    const docNumberMatch = text.match(docNumberPattern);
    if (docNumberMatch) {
      data.documentNumber = docNumberMatch[0];
    }
    const issueDateMatch = text.match(issueDatePattern);
    if (issueDateMatch) {
      data.issueDate = issueDateMatch[0].replace(/(?:ISS|Wz|iz|WIZ|ISSUE)\s*/i, '').trim();
    }
    const expiryDateMatch = text.match(expiryDatePattern);
    if (expiryDateMatch) {
      data.expiryDate = expiryDateMatch[0].replace(/(?:EXP|We|WX|EXPIRY|EXPIRES)\s*/i, '').trim();
    }
    data.fullText = text;  
  
    return data;
  };  
app.post('/upload', upload.single('document'), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);  
  
  Tesseract.recognize(filePath, 'eng')
    .then(({ data: { text } }) => {
      const extractedData = extractDynamicFields(text);  
      res.json(extractedData);  
    })
    .catch((err) => {
      console.error('OCR Error:', err);
      res.status(500).json({ error: 'Failed to extract data' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
