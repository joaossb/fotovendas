export const config = { maxDuration: 60 };

const PROMPTS = {
  cardapio: `You are a professional food photographer specialized in delivery menus, restaurant apps, Just Eat, Uber Eats, iFood, Instagram, WhatsApp and digital menus.
Analyze the reference image carefully. Write one complete prompt in English, max 130 words, to create a professional photo of this exact same food or beverage item.
The reference image is the main source of truth. Preserve the same product, ingredients, portion logic, shape, topping distribution and presentation style. Do not add ingredients that are not visible or described. Improve lighting, texture, sharpness, background and appetite appeal without making it fake or misleading.
Adapt the style to the product category: pizza, burger, sushi, pasta, cake, grilled food, homemade meal, drink, dessert, etc.
Use realistic commercial food photography, clear delivery-app readability, appetizing texture, professional lighting, believable plating or packaging, and a background appropriate to the product.
Include a short negative prompt at the end.
Start with: Professional delivery menu food photo of.
Reply ONLY with the prompt.`,

  joias: `You are a professional commercial jewelry photographer specialized in lifestyle and wearable product shots.
Analyze the reference image carefully. Write one complete prompt in English, max 130 words, to create a commercial lifestyle photo of this exact same jewelry piece being worn by a model.
The reference image is the main source of truth. Preserve the exact design, geometry, proportions, metal color, gemstone type, gemstone color, setting style, texture and craftsmanship of the jewelry. Do not redesign, simplify, add stones, remove stones, or alter the piece in any way.
The jewelry must be shown worn on the correct body part: earring on an ear, ring on a finger, bracelet on a wrist, necklace on a neck. Frame the shot as a close commercial crop showing only the jewelry and the body part it is worn on. Do not show the model's face or full body.
Use soft natural or studio lighting, clean neutral background, sharp focus on the jewelry, realistic skin texture, elegant and commercial presentation.
Include a short negative prompt at the end.
Start with: Professional commercial jewelry lifestyle photo of.
Reply ONLY with the prompt.`,

  curriculo: `You are a professional portrait photographer specialized in LinkedIn, resume and corporate headshots.
Analyze the reference photo carefully. Write one complete prompt in English, max 130 words, to create a professional headshot of this same person.
Preserve the person's real facial structure, age impression, hairstyle, skin tone, expression identity and overall appearance. Do not beautify excessively, change facial features, change age, alter body shape, or create an unrealistic model-like version.
Improve only the professional presentation: clean background, posture, lighting, clothing polish, sharpness, natural confidence and corporate credibility.
Use a neutral light gray, white, or softly blurred office-style background; professional studio lighting; soft natural shadows; sharp focus on the face; realistic skin texture; natural and approachable expression; business-appropriate attire.
Include a short negative prompt at the end.
Start with: Professional corporate headshot photo of.
Reply ONLY with the prompt.`,

  ecommerce: `You are a professional e-commerce product photographer specialized in marketplace and online store listings.
Analyze the reference image carefully. Write one complete prompt in English, max 130 words, to create a clean e-commerce photo of this exact same product.
The reference image is the main source of truth. Preserve the product's exact type, shape, proportions, material, color, labels, details, packaging, texture and visible features. Do not redesign, change branding, remove important details, add accessories, or alter the product function.
Improve only the photographic quality: clean lighting, sharpness, perspective, background, color accuracy and listing clarity.
Use a pure white or very light neutral background, even studio lighting, minimal shadow, centered composition, full product visibility, realistic scale, crisp edges and Amazon/Shopify marketplace quality.
Include a short negative prompt at the end.
Start with: Professional e-commerce product photo of.
Reply ONLY with the prompt.`,
};

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

  const { imageBase64, mimeType, category, plan, descricao } = req.body;

  if (!imageBase64 || !category) {
    return res.status(400).json({ error: "Imagem e categoria sao obrigatorios." });
  }

  const systemPrompt = PROMPTS[category];
  if (!systemPrompt) {
    return res.status(400).json({ error: "Categoria invalida: " + category });
  }

  // Passo 1: Claude analisa a imagem e gera o prompt
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
                text: systemPrompt + (descricao ? "\n\nNote from the owner about this dish: " + descricao + ". Use this only to confirm your visual analysis — the image is the main reference." : ""),
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
      throw new Error("Nao foi possivel analisar a imagem.");
    }
  } catch (err) {
    return res.status(500).json({ error: "Erro ao analisar produto: " + err.message });
  }

  // Passo 2: Gemini gera a imagem
  const model = plan === "pro"
    ? "gemini-3-pro-image-preview"
    : "gemini-3.1-flash-image-preview";

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + process.env.GOOGLE_AI_KEY;

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