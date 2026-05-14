import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end",  () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig    = req.headers["stripe-signature"];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session  = event.data.object;
    const { userId, credits } = session.metadata;
    const creditsToAdd = parseInt(credits, 10);

    if (!userId || !creditsToAdd) {
      console.error("Metadata incompleta:", session.metadata);
      return res.status(400).json({ error: "Metadata incompleta." });
    }

    // Conecta ao Supabase com a service key (acesso total)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Busca créditos atuais e soma
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar perfil:", fetchError);
      return res.status(500).json({ error: "Erro ao buscar perfil." });
    }

    const newCredits = (profile.credits || 0) + creditsToAdd;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", userId);

    if (updateError) {
      console.error("Erro ao atualizar créditos:", updateError);
      return res.status(500).json({ error: "Erro ao atualizar créditos." });
    }

    console.log(`+${creditsToAdd} créditos adicionados para userId ${userId}. Total: ${newCredits}`);
  }

  return res.status(200).json({ received: true });
}