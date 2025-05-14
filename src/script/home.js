async function askAI() {
  const jokeEl = document.getElementById("jokeOutput");
  jokeEl.innerText = "🤖 Generating a joke...";

  try {
    const jokeRes = await fetch("/api/generate-joke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
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
  }
}
