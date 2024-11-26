// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Express app
const app = express();
const port = 5000;

// Initialize the Generative AI client using the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'tunedModels/aidapublic-ozpxoaff5jpo' });


async function prepareAndSendUserPrompt(userInput) {
    try {
        // Send to backend
        const response = await fetch("http://localhost:5000/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();
        displayResponse(data.response); // display the response in your assistant UI
    } catch (error) {
        console.error("Error:", error);
    }
}


// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // Ensure 'public' directory is specified

// Route to serve index.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle chat messages
app.post('/generate', async (req, res) => {
  const userPrompt = req.body.prompt;
  try {
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = await response.text(); // Change to text() if response is a stream
    res.json({ response: text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

function displayResponse(response) {
    const assistantMessageContainer = document.getElementById("assistant-response");
    assistantMessageContainer.textContent = response;
}


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
