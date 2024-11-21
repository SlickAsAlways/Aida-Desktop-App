// Existing imports and setup

const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: 'tunedModels/aidapremium-915oeddskbhn',
});

const generationConfig = {
    temperature: 0.15,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

const app = express();
app.use(bodyParser.json());

// Basic route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Route to handle chat messages
app.post('/generate', async (req, res) => {
    const userPrompt = req.body.prompt;
    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: 'user',
                    parts: [{ text: "hello" }],
                },
                {
                    role: 'model',
                    parts: [{ text: "Hello! 👋 It's nice to hear from you. How can I be of assistance? 😊" }],
                },
                // Add more history entries as needed...
            ],
        });

        const result = await chatSession.sendMessage(userPrompt); // Send the user's message to the AI
        const responseText = result.response.text(); // Get the AI's response
        res.json({ response: responseText }); // Send back the response as JSON
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
