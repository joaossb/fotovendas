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
  const { plan, userEmail } = req.body;

  const priceMap = {
    basic: process.env.STRIPE_PRICE_BASIC,
    pro: process.env.STRIPE_PRICE_PRO,
  };

  const priceId = priceMap[plan];
  if (!priceId) return res.status(400).json({ error: "Plano inválido." });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/planos`,
      metadata: { plan, userEmail },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}