export const getChatBot = async (req, res) => {
  const { messages } = req.body;
    
  const response = await fetch(process.env.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      model: "gemini-3-flash-preview",
      messages,
    }),
  });
  

  const text = await response.text();
  const data = JSON.parse(text);
  const assistantMessage = data.choices[0].message;

  return res.status(200).json({
    success: true,
    data: assistantMessage.content,
  });
};