// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Express app
const app = express();
const port = process.env.PORT || 8080; // Use environment PORT if available

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize the Generative AI client using the API key from environment variables
const genAI = new GoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY }); // Ensure API key is correctly passed
const modelName = process.env.MODEL_NAME || 'tunedModels/aidapublic-ozpxoaff5jpo';

// Route to handle chat messages
app.post('/generate', async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Use the Generative AI API to generate a response
    const result = await genAI.generateText({
      model: modelName,
      prompt: userPrompt,
    });

    // Extract the text from the API response
    const text = result.candidates[0]?.output || 'No response generated';
    res.json({ response: text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// ==================== Frontend Integration ====================

// Detect the backend URL dynamically (local or deployed)
const getBackendUrl = () => {
  // Use environment variable if provided, or default to Railway URL
  return process.env.BACKEND_URL || 'https://aida-desktop-app-production.up.railway.app/';
};

async function prepareAndSendUserPrompt(userInput) {
  try {
    const backendUrl = getBackendUrl(); // Get the correct backend URL
    const response = await fetch(`${backendUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userInput }),
    });

    const data = await response.json();

    if (data.response) {
      displayResponse(data.response); // Display the response in your assistant UI
    } else {
      displayResponse('Sorry, no response available.');
    }
  } catch (error) {
    console.error('Error:', error);
    displayResponse('An error occurred. Please try again later.');
  }
}

function displayResponse(response) {
  const assistantMessageContainer = document.getElementById('assistant-response');
  assistantMessageContainer.textContent = response;
}
