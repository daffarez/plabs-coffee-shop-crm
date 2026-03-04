export const callOpenRouter = async (
  messages: any[],
  isJson: boolean = false,
) => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: messages,
        response_format: isJson ? { type: "json_object" } : undefined,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenRouter API Error");
  }

  return await response.json();
};
