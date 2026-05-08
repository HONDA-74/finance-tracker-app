export const getChatBot = async (req, res) => {
  const { messages } = req.body;
  const apiMessages = messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'object' && msg.content !== null 
             ? msg.content.changingThisBreaksApplicationSecurity 
             : msg.content
  }));

  try {
    const response = await fetch(process.env.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: apiMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        message: data.error?.message || "API Error" 
      });
    }

    return res.status(200).json({
      success: true,
      data: data.choices[0].message.content,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};