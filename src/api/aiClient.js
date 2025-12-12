// src/api/aiClient.js
export async function callAI(prompt) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("مفتاح الذكاء الاصطناعي غير موجود (VITE_OPENAI_API_KEY).");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "أنت خبير في اللغة العربية الفصحى والتشكيل." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI error:", text);
    throw new Error("فشل الاتصال بخدمة الذكاء الاصطناعي.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return content || "";
}
