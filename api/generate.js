export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo nao permitido" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { imageBase64, mimeType, style, plan } = req.body;

  if (!imageBase64 || !style) {
    return res.status(400).json({ error: "Imagem e estilo sao obrigatorios." });
  }

  let prompt;
  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType || "image/jpeg",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "You are a professional product photographer. Analyze this product image. Write a prompt in English (max 80 words) to create a professional studio photo of this exact product for " + style + ". Describe product appearance, colors, shape. Add: white background, studio lighting, sharp focus, commercial quality. Start with: Professional product photo of. Reply ONLY with the prompt.",
              },
            ],
          },
        ],
      }),
    });

    const claudeData = await claudeRes.json();
    if (claudeData.error) {
      throw new Error(claudeData.error.message);
    }
    const textBlock = claudeData.content && claudeData.content.find(function(b) { return b.type === "text"; });
    prompt = textBlock && textBlock.text && textBlock.text.trim();
    if (!prompt) {
      throw new Error("Nao foi possivel analisar o produto.");
    }
  } catch (err) {
    return res.status(500).json({ error: "Erro ao analisar produto: " + err.message });
  }

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=" + process.env.GOOGLE_AI_KEY;

  try {
    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType || "image/jpeg",
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    });

    const geminiText = await geminiRes.text();
    let geminiData;
    try {
      geminiData = JSON.parse(geminiText);
    } catch (e) {
      throw new Error("Gemini respondeu: " + geminiText.substring(0, 300));
    }

    if (geminiData.error) {
      throw new Error(geminiData.error.message);
    }

    const parts = geminiData.candidates &&
      geminiData.candidates[0] &&
      geminiData.candidates[0].content &&
      geminiData.candidates[0].content.parts;

    const imgPart = parts && parts.find(function(p) {
      return p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.indexOf("image/") === 0;
    });

    if (!imgPart) {
      throw new Error("Nenhuma imagem gerada. Resposta: " + geminiText.substring(0, 300));
    }

    return res.status(200).json({
      image: imgPart.inlineData.data,
      mimeType: imgPart.inlineData.mimeType,
      prompt: prompt,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao gerar imagem: " + err.message });
  }
}