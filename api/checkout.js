import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).end();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { plan, userEmail, userId } = req.body;

  const priceMap = {
    starter: { priceId: process.env.STRIPE_PRICE_BASIC,  credits: 10  },
    pro:     { priceId: process.env.STRIPE_PRICE_PRO,    credits: 30  },
    agency:  { priceId: process.env.STRIPE_PRICE_AGENCY, credits: 50  },
  };

  console.log("Plan recebido:", plan);
console.log("PriceMap keys:", Object.keys(priceMap));
console.log("Selected:", priceMap[plan]);
console.log("STRIPE_PRICE_BASIC:", process.env.STRIPE_PRICE_BASIC ? "ok" : "undefined");

  const selected = priceMap[plan];
  if (!selected) return res.status(400).json({ error: "Plano inválido." });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",                  // pagamento único
      customer_email: userEmail,
      line_items: [{ price: selected.priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/?payment=success&plan=${plan}&credits=${selected.credits}&userId=${userId}`,
      cancel_url:  `${req.headers.origin}/?payment=cancelled`,
      metadata: { plan, userEmail, userId, credits: String(selected.credits) },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}