// ✅ home.js

async function askAI() {
  const jokeEl = document.getElementById("jokeOutput");
  jokeEl.innerText = "🤖 Generating a joke...";

  try {
    const jokeRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "PathPal"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        stream: false,
        messages: [
          { role: "user", content: "Tell me a short and funny joke." }
        ]
      })
    });

    const jokeData = await jokeRes.json();
    const joke = jokeData.choices?.[0]?.message?.content
          ?.replace(/\n{2,}/g, '\n')
          ?.trim();

    if (!joke) throw new Error("No joke received");
    jokeEl.innerText = joke;

  } catch (err) {
    console.error("❌ Joke Error:", err);
    jokeEl.innerText = "😢 Failed to fetch joke.";
    return null;
  }
}
