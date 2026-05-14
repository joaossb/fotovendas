export const config = { maxDuration: 60 };

const PROMPT = `Use the provided reference image as the primary visual guide. Recreate the exact same food product shown in the image, preserving the real ingredients, portion size, preparation style, structure, and overall identity of the dish. Do not invent a different meal, do not gourmetize unrealistically, and do not add ingredients that are not visible in the reference image.

Create a more aggressive, high-conversion food photograph optimized for delivery apps like iFood, Uber Eats, Just Eat, DoorDash, Instagram food ads, and digital menus. The image must feel highly appetizing, immediate, craveable, and professional, while still believable for a real restaurant product.

Composition: tight close-up or medium-close framing, food dominating most of the frame, minimal empty space, optimized for thumbnail readability. Use a strong hero angle depending on the product: 45-degree angle for plated meals, burgers, meats and pasta; slight top-down for pizzas, sushi, bowls and trays; macro emphasis when texture is important. The main product must be the clear visual focus.

Lighting: stronger directional lighting with controlled shadows and realistic highlights, creating depth and appetite without looking artificial. Use cinematic but believable food lighting, emphasizing texture and freshness.

Texture emphasis: highlight the most desirable characteristics naturally visible in the product — grilled surfaces, crispy edges, melted cheese, juicy meat fibers, fluffy rice grains, creamy sauces, toasted crusts, fresh vegetables, crunchy breading, glossy chocolate, airy dough, steam softness, etc — only when coherent with the original product.

Background: clean and controlled environment matching the product category. Rustic wood for barbecue or homemade food, neutral dark surfaces for premium dishes, light clean surfaces for bakery or healthy food, subtle contextual styling when appropriate. Avoid visual clutter.

Camera style: ultra-realistic professional food photography, full-frame camera, 50mm or 85mm lens, shallow depth of field, detailed texture rendering, realistic optical behavior, natural perspective.

Post-processing: refined contrast, subtle sharpening on textures, controlled warmth, realistic color grading, high detail, premium commercial finish, no exaggerated HDR or artificial saturation.

Goal: create immediate appetite appeal and maximize conversion in delivery app thumbnails while remaining realistic and faithful to the actual restaurant product shown in the original image.

Negative Prompt: Do not change the core product. Do not add ingredients, sauces, garnishes, side dishes, decorations, or drinks not visible in the reference image. Avoid fake food-porn styling, exaggerated steam, excessive gloss, unrealistic cheese pulls, oversized portions, artificial textures, CGI look, plastic-looking food, stock-photo appearance, distorted anatomy, over-sharpening, oversaturation, fine-dining plating incompatible with delivery, unrealistic lighting, messy composition, or obvious AI artifacts.`;

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

  const { imageBase64, mimeType, descricao } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Imagem obrigatoria." });
  }

  // Se o cliente descreveu o prato, adicionamos como contexto extra
  const finalPrompt = descricao && descricao.trim()
    ? `The dish in the reference image is: ${descricao.trim()}. ` + PROMPT
    : PROMPT;

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=" + process.env.GOOGLE_AI_KEY;

  try {
    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: finalPrompt },
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
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao gerar imagem: " + err.message });
  }
}