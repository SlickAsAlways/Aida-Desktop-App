// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Express app
const app = express();
const port = process.env.PORT || 5000; // Use environment PORT if available

// Initialize the Generative AI client using the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'tunedModels/aidapublic-ozpxoaff5jpo' });

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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// ==================== Frontend Integration ====================

// Detect the backend URL dynamically (local or deployed)
const getBackendUrl = () => {
    // Use environment variable if provided, or default to localhost for development
    return process.env.BACKEND_URL || 'https://aida-desktop-app-production.up.railway.app/';
};

async function prepareAndSendUserPrompt(userInput) {
    try {
        const backendUrl = getBackendUrl(); // Get the correct backend URL
        const response = await fetch(`${backendUrl}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userInput })
        });

        const data = await response.json();
        displayResponse(data.response); // Display the response in your assistant UI
    } catch (error) {
        console.error("Error:", error);
    }
}

function displayResponse(response) {
    const assistantMessageContainer = document.getElementById("assistant-response");
    assistantMessageContainer.textContent = response;
}
