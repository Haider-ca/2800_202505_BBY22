fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
   "Authorization": "Bearer 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",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:5001",
    "X-Title": "PathPal"
  },
  body: JSON.stringify({
    model: "mistralai/mistral-7b-instruct",
    stream: false,
    messages: [
      { role: "user", content: "Tell me a short and funny joke." }
    ]
  })
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
