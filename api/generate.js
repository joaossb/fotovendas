export const config = { maxDuration: 60 };

const PROMPT = `Use the provided reference image as the primary visual guide. Recreate the exact same food product shown in the image, preserving the real ingredients, preparation style, proportions, structure, and overall identity of the dish. Do not invent a different meal, do not add ingredients that are not visible in the reference image, and do not transform the product into unrealistic gourmet food.

The final image must look like a professional commercial food photograph created specifically for delivery platforms and digital menus such as iFood, Rappi, Uber Eats, Lieferando, Just Eat, DoorDash, Instagram food ads, and restaurant catalogs.

IMPORTANT:
The result must ALWAYS have a clean, professional, standardized commercial presentation environment.
Never preserve amateur environments from the original image such as delivery boxes, cardboard packaging, plastic tables, checkered tablecloths, casual restaurant tables, cluttered backgrounds, disposable containers, bad lighting, random props, low-quality surfaces, messy composition or amateur restaurant atmosphere.

The food may be repositioned into a more professional presentation while preserving the exact product itself.

Allowed presentation styles:
- clean neutral background;
- elegant wooden table;
- premium dark surface;
- professional ceramic plate;
- rustic serving board when coherent with the product;
- minimal studio setup;
- subtle premium restaurant-style composition suitable for digital menus.

Composition: tight close-up or medium-close framing, food occupying most of the frame, optimized for mobile thumbnails and delivery apps. The product must be the absolute hero of the image. Use professional food composition with minimal distractions and excellent readability at small sizes.

Angle selection:
- 45-degree angle for burgers, meats, executive meals, desserts and pasta;
- slight top-down angle for pizzas, sushi, trays, bowls and combo meals;
- macro proximity when texture is important.

Lighting: professional studio-style food lighting with controlled shadows and realistic highlights. Bright enough for excellent visibility in delivery apps, but still natural and believable. Emphasize texture, freshness and depth without looking artificial.

Texture emphasis: naturally enhance the most attractive characteristics already present in the product — crispy crusts, juicy meats, airy dough, melted cheese, toasted edges, fluffy rice, glossy sauces, fresh vegetables, crunchy breading, creamy fillings, chocolate texture, etc — only when coherent with the original food.

Background and styling: clean, minimal, elegant and commercially standardized. No amateur restaurant environments. No distracting props. No excessive styling. Prioritize polished commercial presentation designed for menu conversion.

Camera style: ultra-realistic professional food photography, full-frame camera, 50mm or 85mm lens, shallow depth of field, realistic optical behavior, premium texture rendering, commercial food styling.

Post-processing: refined contrast, subtle sharpening on food textures, realistic color grading, controlled warmth, natural saturation, premium commercial finish, high detail, no exaggerated HDR or fake cinematic effects.

Goal: create an immediate appetite reaction while maintaining realism, professional presentation, strong readability in thumbnails, and high conversion performance for delivery apps and digital restaurant menus.

Negative prompt:
Do not preserve the original amateur environment. Do not include pizza boxes, delivery packaging, cardboard boxes, checkered tablecloths, plastic tables, cluttered backgrounds, disposable containers, random objects, low-quality restaurant atmosphere, poor lighting, hands, people, utensils as focal points, or distracting props.

Do not change the core product. Do not add ingredients, sauces, garnishes, drinks, or side dishes not visible in the reference image. Avoid fake food-porn styling, excessive steam, unrealistic cheese pulls, oversized portions, artificial textures, CGI look, plastic-looking food, stock-photo appearance, distorted anatomy, over-sharpening, oversaturation, fine-dining plating incompatible with delivery, unrealistic lighting, messy composition, or obvious AI artifacts.`;

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