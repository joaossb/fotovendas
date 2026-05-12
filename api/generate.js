export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { imageBase64, mimeType, style, plan } = req.body;

  if (!imageBase64 || !style) {
    return res.status(400).json({ error: "Imagem e estilo são obrigatórios." });
  }

  // Passo 1: Claude analisa o produto e gera o prompt
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
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{
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
              text: `You are a professional product photographer. Analyze this product image carefully.
Write a detailed image generation prompt in English (max 100 words) to create a professional
studio photo of this EXACT product for use in ${style}.
Describe: exact product appearance, colors, shape, materials.
Add: clean white or gradient background, professional studio lighting, sharp focus,
commercial product photography quality${plan === "pro" ? ", ultra high quality 4K" : ""}.
Start with "Professional product photo,".
Reply ONLY with the prompt, nothing else.`,
            },
          ],
        }],
      }),
    });

    const claudeData = await claudeRes.json();
    if (claudeData.error) throw new Error(claudeData.error.message);
    prompt = claudeData.content?.find(b => b.type === "text")?.text?.trim();
    if (!prompt) throw new Error("Não foi possível analisar o produto.");
  } catch (err) {
    return res.status(500).json({ error: "Erro ao analisar produto: " + err.message });
  }

  // Passo 2: Nano Banana gera a imagem
  const model = plan === "pro"
    ? "gemini-3-pro-image-preview"
    : "gemini-2.0-flash-preview-image-generation";

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_KEY}`;

  try {
    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType || "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    });

    const geminiData = await geminiRes.json();
    if (geminiData.error) throw new Error(geminiData.error.message);

    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith("image/"));
    if (!imgPart) throw new Error("Nenhuma imagem gerada pela API.");

    return res.status(200).json({
      image: imgPart.inlineData.data,
      mimeType: imgPart.inlineData.mimeType,
      prompt,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao gerar imagem: " + err.message });
  }
}