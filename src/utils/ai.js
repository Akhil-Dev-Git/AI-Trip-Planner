const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama3-8b-8192";

export const getGroqApiKey = () => {
  return localStorage.getItem('GROQ_API_KEY');
};

export const setGroqApiKey = (key) => {
  localStorage.setItem('GROQ_API_KEY', key);
};

export const clearGroqApiKey = () => {
  localStorage.removeItem('GROQ_API_KEY');
};

export const chatWithGroq = async (messages, apiKey) => {
  if (!apiKey) {
    throw new Error("Missing Groq API Key. Please configure it in settings.");
  }
  
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to communicate with Groq API");
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
};

// Stream version for the chat assistant
export const streamChatWithGroq = async (messages, apiKey, onChunk, onError, onComplete) => {
  if (!apiKey) {
    onError("Missing Groq API Key. Please configure it in settings.");
    return;
  }
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
        stream: true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      onError(errorData.error?.message || "Failed to communicate with Groq API");
      return;
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    }
    onComplete();
  } catch (err) {
    onError(err.message);
  }
};
