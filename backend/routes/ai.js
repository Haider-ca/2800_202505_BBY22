// backend/ai.js
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); 

router.post("/generate-joke", async (req, res) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
         "HTTP-Referer": "http://localhost:5001",
        "X-Title": "PathPal"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        stream: false,
        messages: [{ role: "user", content: "Tell me a short and funny joke." }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Backend fetch error:", err);
    res.status(500).json({ error: "Failed to fetch joke from AI" });
  }
});

module.exports = router;
